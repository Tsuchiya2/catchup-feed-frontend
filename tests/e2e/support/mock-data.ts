/**
 * Deterministic mock data for the fully-mocked backend API.
 *
 * Shapes mirror the generated Swagger types in src/types/api.d.ts
 * (Subscriber, FeedToken, AccessLog, AccessLogSummary, Article, Source).
 * Do not invent fields that the backend does not return.
 */

/** Fixed "now" reference for relative dates (freshly computed per import). */
const NOW = Date.now();

const daysAgo = (days: number): string => new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();

// ---------------------------------------------------------------------------
// Subscribers (friends)
// ---------------------------------------------------------------------------

export interface MockSubscriber {
  id: number;
  name: string;
  email: string | null;
  note: string | null;
  active: boolean;
  created_at: string;
  deactivated_at: string | null;
}

export const makeSubscribers = (): MockSubscriber[] => [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    note: 'College friend, Go enthusiast',
    active: true,
    created_at: daysAgo(60),
    deactivated_at: null,
  },
  {
    id: 2,
    name: 'Bob',
    email: null,
    note: null,
    active: true,
    created_at: daysAgo(50),
    deactivated_at: null,
  },
  {
    id: 3,
    name: 'Carol',
    email: 'carol@example.com',
    note: 'Moved abroad',
    active: false,
    created_at: daysAgo(90),
    deactivated_at: daysAgo(10),
  },
  {
    id: 4,
    name: 'Dave',
    email: null,
    note: 'Signed up but never subscribed',
    active: true,
    created_at: daysAgo(30),
    deactivated_at: null,
  },
];

// ---------------------------------------------------------------------------
// Feed tokens (per subscriber; plaintext NEVER appears in listings — D-5)
// ---------------------------------------------------------------------------

export interface MockFeedToken {
  id: number;
  subscriber_id: number;
  active: boolean;
  created_at: string;
  revoked_at: string | null;
}

export const makeTokens = (): MockFeedToken[] => [
  { id: 101, subscriber_id: 1, active: true, created_at: daysAgo(59), revoked_at: null },
  { id: 102, subscriber_id: 1, active: false, created_at: daysAgo(80), revoked_at: daysAgo(60) },
  { id: 103, subscriber_id: 2, active: true, created_at: daysAgo(49), revoked_at: null },
];

/**
 * `note` on the DELETE /tokens/:id response (RevokedTokenDTO), pinning the
 * §5.2 irreversibility semantics. Mirrors the backend's revokeNote constant.
 */
export const REVOKE_NOTE =
  'revocation is irreversible; issue a new token to restore access (§5.2)';

/** One-time plaintext returned by POST /subscribers/:id/tokens (D-5). */
export const ISSUED_PLAINTEXT_TOKEN = 'e2e-plain-token-abc123';
export const ISSUED_FEED_URL = `https://feeds.example.test/feeds/${ISSUED_PLAINTEXT_TOKEN}/feed.xml`;

// ---------------------------------------------------------------------------
// Access logs
// ---------------------------------------------------------------------------

export interface MockAccessLog {
  id: number;
  subscriber_id: number;
  subscriber_name: string;
  token_id: number;
  episode_id: number | null;
  user_agent: string | null;
  accessed_at: string;
}

export const makeAccessLogs = (): MockAccessLog[] => [
  {
    id: 1005,
    subscriber_id: 1,
    subscriber_name: 'Alice',
    token_id: 101,
    episode_id: 42,
    user_agent: 'Overcast/2026.1 (+http://overcast.fm)',
    accessed_at: daysAgo(0),
  },
  {
    id: 1004,
    subscriber_id: 1,
    subscriber_name: 'Alice',
    token_id: 101,
    episode_id: null,
    user_agent: 'Overcast/2026.1 (+http://overcast.fm)',
    accessed_at: daysAgo(1),
  },
  {
    id: 1003,
    subscriber_id: 1,
    subscriber_name: 'Alice',
    token_id: 101,
    episode_id: 41,
    user_agent: null,
    accessed_at: daysAgo(2),
  },
  {
    id: 1002,
    subscriber_id: 2,
    subscriber_name: 'Bob',
    token_id: 103,
    episode_id: null,
    user_agent: 'AntennaPod/3.4.0',
    accessed_at: daysAgo(25),
  },
  {
    id: 1001,
    subscriber_id: 2,
    subscriber_name: 'Bob',
    token_id: 103,
    episode_id: 12,
    user_agent: 'AntennaPod/3.4.0',
    accessed_at: daysAgo(26),
  },
];

export interface MockAccessLogSummary {
  subscriber_id: number;
  subscriber_name: string;
  active: boolean;
  last_accessed_at: string | null;
  days_since_last_access: number | null;
  count_7d: number;
  count_30d: number;
}

/**
 * Summary rows exercising every neglect level
 * (thresholds: WARN_DAYS=14, ALERT_DAYS=21):
 * Alice=ok(1d), Bob=alert(25d silent), Carol=deactivated, Dave=never accessed.
 */
export const makeAccessLogSummary = (): MockAccessLogSummary[] => [
  {
    subscriber_id: 1,
    subscriber_name: 'Alice',
    active: true,
    last_accessed_at: daysAgo(1),
    days_since_last_access: 1,
    count_7d: 5,
    count_30d: 18,
  },
  {
    subscriber_id: 2,
    subscriber_name: 'Bob',
    active: true,
    last_accessed_at: daysAgo(25),
    days_since_last_access: 25,
    count_7d: 0,
    count_30d: 2,
  },
  {
    subscriber_id: 3,
    subscriber_name: 'Carol',
    active: false,
    last_accessed_at: daysAgo(40),
    days_since_last_access: 40,
    count_7d: 0,
    count_30d: 0,
  },
  {
    subscriber_id: 4,
    subscriber_name: 'Dave',
    active: true,
    last_accessed_at: null,
    days_since_last_access: null,
    count_7d: 0,
    count_30d: 0,
  },
];

// ---------------------------------------------------------------------------
// Articles (paginated) & Sources
// ---------------------------------------------------------------------------

export interface MockArticle {
  id: number;
  title: string;
  summary: string;
  url: string;
  source_id: number;
  source_name: string;
  published_at: string;
  crawled_at: string;
}

export const ARTICLE_COUNT = 25;

export const makeArticles = (): MockArticle[] =>
  Array.from({ length: ARTICLE_COUNT }, (_, i) => {
    const id = ARTICLE_COUNT - i; // newest first
    return {
      id,
      title: id === 25 ? 'Go 1.25 Released' : `Sample Article ${id}`,
      summary: `AI summary for article ${id}: concise digest of the original post.`,
      url: `https://blog.example.test/posts/${id}`,
      source_id: (id % 2) + 1,
      source_name: (id % 2) + 1 === 1 ? 'Go Blog' : 'Hacker News',
      published_at: daysAgo(i + 1),
      crawled_at: daysAgo(i),
    };
  });

export interface MockSource {
  id: number;
  name: string;
  url: string;
  feed_url: string;
  category: string;
  lang: string;
  active: boolean;
  created_at: string;
}

export const makeSources = (): MockSource[] => [
  {
    id: 1,
    name: 'Go Blog',
    url: 'https://go.dev/blog/feed.atom',
    feed_url: 'https://go.dev/blog/feed.atom',
    category: 'tech',
    lang: 'en',
    active: true,
    created_at: daysAgo(200),
  },
  {
    id: 2,
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    feed_url: 'https://news.ycombinator.com/rss',
    category: 'tech',
    lang: 'en',
    active: true,
    created_at: daysAgo(150),
  },
  {
    id: 3,
    name: 'Old Feed',
    url: 'https://old.example.test/rss',
    feed_url: 'https://old.example.test/rss',
    category: 'news',
    lang: 'ja',
    active: false,
    created_at: daysAgo(300),
  },
];
