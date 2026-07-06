/**
 * Route-interception mock of the backend API.
 *
 * Every request to MOCK_API_URL (a dead port — see playwright.config.ts) is
 * fulfilled in the browser context, so e2e runs are deterministic and never
 * touch a real backend. State is per-test and mutable: POST/PUT/DELETE
 * handlers update the in-memory arrays so the UI's refetches observe the
 * change, mimicking the real server contract documented in
 * src/lib/api/endpoints/*.
 *
 * Per-test overrides: register `page.route()` in the spec — page routes take
 * precedence over these context-level routes.
 */
import type { BrowserContext, Route } from '@playwright/test';
import { MOCK_API_URL } from './constants';
import { makeMockJwt, TEST_CREDENTIALS } from './auth';
import {
  ISSUED_FEED_URL,
  ISSUED_PLAINTEXT_TOKEN,
  REVOKE_NOTE,
  makeAccessLogs,
  makeAccessLogSummary,
  makeArticles,
  makeSources,
  makeSubscribers,
  makeTokens,
  type MockAccessLog,
  type MockAccessLogSummary,
  type MockArticle,
  type MockFeedToken,
  type MockSource,
  type MockSubscriber,
} from './mock-data';

export { MOCK_API_URL };

const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': 'authorization, content-type, x-csrf-token',
};

/** Mutable per-test backend state. */
export class ApiMock {
  subscribers: MockSubscriber[] = makeSubscribers();
  tokens: MockFeedToken[] = makeTokens();
  accessLogs: MockAccessLog[] = makeAccessLogs();
  accessLogSummary: MockAccessLogSummary[] = makeAccessLogSummary();
  articles: MockArticle[] = makeArticles();
  sources: MockSource[] = makeSources();

  private nextId = 9000;

  async install(context: BrowserContext): Promise<void> {
    await context.route(`${MOCK_API_URL}/**`, (route) => this.handle(route));
  }

  // -- helpers --------------------------------------------------------------

  private fulfillJson(route: Route, body: unknown, status = 200): Promise<void> {
    return route.fulfill({
      status,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: JSON.stringify(body),
    });
  }

  /**
   * Error body matching the real backend: respond.SafeError writes
   * `{"error": message}` (no `message` key), which is what every handler
   * except POST /auth/token uses. The auth handler goes through http.Error
   * and returns text/plain instead — see the auth branch in handle().
   */
  private fulfillError(route: Route, status: number, message: string): Promise<void> {
    return this.fulfillJson(route, { error: message }, status);
  }

  /** Plain-text error exactly as Go's http.Error writes it (message + LF). */
  private fulfillPlainTextError(route: Route, status: number, message: string): Promise<void> {
    return route.fulfill({
      status,
      contentType: 'text/plain; charset=utf-8',
      headers: CORS_HEADERS,
      body: `${message}\n`,
    });
  }

  // -- dispatcher -----------------------------------------------------------

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const path = url.pathname;

    // CORS preflight (the app origin differs from the API origin)
    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    let match: RegExpMatchArray | null;

    // ---- auth ----
    if (method === 'POST' && path === '/auth/token') {
      const body = request.postDataJSON() as { email?: string; password?: string };
      if (body.email === TEST_CREDENTIALS.email && body.password === TEST_CREDENTIALS.password) {
        await this.fulfillJson(route, { token: makeMockJwt() });
      } else {
        // The real handler rejects credentials via http.Error → plain text.
        await this.fulfillPlainTextError(route, 401, 'unauthorized');
      }
      return;
    }

    // ---- subscribers ----
    if (path === '/subscribers' && method === 'GET') {
      await this.fulfillJson(route, this.subscribers);
      return;
    }
    if (path === '/subscribers' && method === 'POST') {
      const body = request.postDataJSON() as Partial<MockSubscriber>;
      const created: MockSubscriber = {
        id: this.nextId++,
        name: body.name ?? '',
        email: body.email ?? null,
        note: body.note ?? null,
        active: true,
        created_at: new Date().toISOString(),
        deactivated_at: null,
      };
      this.subscribers.push(created);
      await this.fulfillJson(route, created, 201);
      return;
    }
    if ((match = path.match(/^\/subscribers\/(\d+)$/))) {
      const id = Number(match[1]);
      const subscriber = this.subscribers.find((s) => s.id === id);
      if (!subscriber) {
        await this.fulfillError(route, 404, 'subscriber not found');
        return;
      }
      if (method === 'GET') {
        await this.fulfillJson(route, subscriber);
        return;
      }
      if (method === 'PUT') {
        const body = request.postDataJSON() as Partial<MockSubscriber>;
        subscriber.name = body.name ?? '';
        subscriber.email = body.email ?? null;
        subscriber.note = body.note ?? null;
        await this.fulfillJson(route, subscriber);
        return;
      }
      if (method === 'DELETE') {
        // Soft delete: deactivation only, the row survives.
        subscriber.active = false;
        subscriber.deactivated_at = new Date().toISOString();
        await this.fulfillJson(route, subscriber);
        return;
      }
    }

    // ---- feed tokens ----
    if ((match = path.match(/^\/subscribers\/(\d+)\/tokens$/))) {
      const subscriberId = Number(match[1]);
      const subscriber = this.subscribers.find((s) => s.id === subscriberId);
      if (!subscriber) {
        await this.fulfillError(route, 404, 'subscriber not found');
        return;
      }
      if (method === 'GET') {
        await this.fulfillJson(
          route,
          this.tokens.filter((t) => t.subscriber_id === subscriberId)
        );
        return;
      }
      if (method === 'POST') {
        if (!subscriber.active) {
          await this.fulfillError(route, 409, 'subscriber is deactivated');
          return;
        }
        const created: MockFeedToken = {
          id: this.nextId++,
          subscriber_id: subscriberId,
          active: true,
          created_at: new Date().toISOString(),
          revoked_at: null,
        };
        this.tokens.push(created);
        // Plaintext + feed URL are returned exactly once (D-5); the token
        // listing above never contains them.
        await this.fulfillJson(
          route,
          { ...created, token: ISSUED_PLAINTEXT_TOKEN, feed_url: ISSUED_FEED_URL },
          201
        );
        return;
      }
    }
    if ((match = path.match(/^\/tokens\/(\d+)$/)) && method === 'DELETE') {
      const id = Number(match[1]);
      const token = this.tokens.find((t) => t.id === id);
      if (!token) {
        await this.fulfillError(route, 404, 'token not found');
        return;
      }
      token.active = false;
      token.revoked_at = new Date().toISOString();
      // RevokedTokenDTO = TokenDTO + note (the §5.2 irreversibility notice).
      await this.fulfillJson(route, { ...token, note: REVOKE_NOTE });
      return;
    }

    // ---- access logs ----
    if (path === '/access-logs/summary' && method === 'GET') {
      await this.fulfillJson(route, this.accessLogSummary);
      return;
    }
    if (path === '/access-logs' && method === 'GET') {
      const subscriberId = url.searchParams.get('subscriber_id');
      const limit = Number(url.searchParams.get('limit') ?? '100');
      let logs = this.accessLogs;
      if (subscriberId !== null) {
        logs = logs.filter((log) => log.subscriber_id === Number(subscriberId));
      }
      await this.fulfillJson(route, logs.slice(0, limit));
      return;
    }

    // ---- articles ----
    if ((path === '/articles' || path === '/articles/search') && method === 'GET') {
      const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? '';
      const sourceId = url.searchParams.get('source_id');
      let items = this.articles;
      if (path === '/articles/search') {
        if (keyword) {
          items = items.filter(
            (a) =>
              a.title.toLowerCase().includes(keyword) || a.summary.toLowerCase().includes(keyword)
          );
        }
        if (sourceId !== null) {
          items = items.filter((a) => a.source_id === Number(sourceId));
        }
      }
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const start = (page - 1) * limit;
      await this.fulfillJson(route, {
        data: items.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: items.length,
          total_pages: Math.max(1, Math.ceil(items.length / limit)),
        },
      });
      return;
    }
    if ((match = path.match(/^\/articles\/(\d+)$/)) && method === 'GET') {
      const article = this.articles.find((a) => a.id === Number(match![1]));
      if (!article) {
        await this.fulfillError(route, 404, 'article not found');
        return;
      }
      await this.fulfillJson(route, article);
      return;
    }

    // ---- sources ----
    if (path === '/sources' && method === 'GET') {
      await this.fulfillJson(route, this.sources);
      return;
    }
    if (path === '/sources/search' && method === 'GET') {
      const keyword = url.searchParams.get('keyword')?.toLowerCase() ?? '';
      const active = url.searchParams.get('active');
      const category = url.searchParams.get('category');
      let items = this.sources;
      if (keyword) {
        items = items.filter(
          (s) => s.name.toLowerCase().includes(keyword) || s.url.toLowerCase().includes(keyword)
        );
      }
      if (active !== null) {
        items = items.filter((s) => s.active === (active === 'true'));
      }
      if (category) {
        items = items.filter((s) => s.category === category);
      }
      await this.fulfillJson(route, items);
      return;
    }
    if (path === '/sources' && method === 'POST') {
      // CreateRequest uses feedURL; the DTO returns feed_url/url.
      const body = request.postDataJSON() as Partial<MockSource> & { feedURL?: string };
      const feedUrl = body.feedURL ?? body.url ?? '';
      const created: MockSource = {
        id: this.nextId++,
        name: body.name ?? '',
        url: feedUrl,
        feed_url: feedUrl,
        category: body.category ?? '',
        lang: body.lang ?? '',
        active: true,
        created_at: new Date().toISOString(),
      };
      this.sources.push(created);
      await this.fulfillJson(route, created, 201);
      return;
    }
    if ((match = path.match(/^\/sources\/(\d+)$/))) {
      const id = Number(match[1]);
      const index = this.sources.findIndex((s) => s.id === id);
      if (index === -1) {
        await this.fulfillError(route, 404, 'source not found');
        return;
      }
      if (method === 'PUT') {
        const body = request.postDataJSON() as Partial<MockSource>;
        this.sources[index] = { ...this.sources[index], ...body };
        await this.fulfillJson(route, this.sources[index]);
        return;
      }
      if (method === 'DELETE') {
        this.sources.splice(index, 1);
        await route.fulfill({ status: 204, headers: CORS_HEADERS });
        return;
      }
    }

    // Anything unmodelled is a test bug — fail loudly instead of hanging.
    await this.fulfillError(route, 501, `e2e ApiMock: unhandled ${method} ${path}`);
  }
}
