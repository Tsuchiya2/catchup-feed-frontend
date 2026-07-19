import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import {
  Serwist,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
  StaleWhileRevalidate,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Cache name for benign (non-sensitive) API responses. Kept in a constant so
 * logout can purge it (see the CLEAR_API_CACHE message handler below).
 */
const API_CACHE_NAME = 'api-cache';

/**
 * Path segments for authenticated, privacy-sensitive management endpoints
 * (M-3). Responses from these must never be written to the Service Worker
 * cache: they contain friend PII, feed tokens, access logs, learning data,
 * the private book library (C-22), viewer accounts (name + login email,
 * D-27), and the caller's own identity (`/auth/me` returns an email in
 * `sub`). They are matched anywhere in the pathname because the backend
 * serves them without an `/api/` prefix (e.g. `/subscribers`,
 * `/tokens/:id`), and may also be reached through an `/api/`-prefixed
 * proxy.
 */
const SENSITIVE_API_SEGMENTS = [
  '/subscribers',
  '/tokens',
  '/access-logs',
  '/learning',
  '/books',
  '/viewers',
  '/auth/me',
];

/**
 * True when the request targets a sensitive management endpoint that must not
 * be cached. Matches the segment at the root (`/subscribers`, `/subscribers/1`)
 * or under an `/api/` proxy prefix (`/api/subscribers`), while avoiding false
 * positives on unrelated paths that merely contain the substring.
 */
function isSensitiveApiPath(pathname: string): boolean {
  return SENSITIVE_API_SEGMENTS.some(
    (segment) =>
      pathname === segment ||
      pathname.startsWith(`${segment}/`) ||
      pathname.startsWith(`/api${segment}`)
  );
}

try {
  const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
      // Strategy 1: Google Fonts Stylesheets
      {
        matcher: ({ url }) => url.origin === 'https://fonts.googleapis.com',
        handler: new CacheFirst({
          cacheName: 'google-fonts-cache',
          plugins: [
            new ExpirationPlugin({
              maxEntries: 10,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }),
      },
      // Strategy 2: Google Static Fonts
      {
        matcher: ({ url }) => url.origin === 'https://fonts.gstatic.com',
        handler: new CacheFirst({
          cacheName: 'gstatic-fonts-cache',
          plugins: [
            new ExpirationPlugin({
              maxEntries: 10,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }),
      },
      // Strategy 3: Images
      {
        matcher: ({ request }) => request.destination === 'image',
        handler: new CacheFirst({
          cacheName: 'image-cache',
          plugins: [
            new ExpirationPlugin({
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }),
      },
      // Strategy 4: Static Resources (JS, CSS, fonts)
      {
        matcher: ({ request }) =>
          request.destination === 'script' ||
          request.destination === 'style' ||
          request.destination === 'font',
        handler: new StaleWhileRevalidate({
          cacheName: 'static-resources-cache',
          plugins: [
            new ExpirationPlugin({
              maxEntries: 50,
              maxAgeSeconds: 24 * 60 * 60, // 1 day
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }),
      },
      // Strategy 5a: Sensitive management APIs — never cached (M-3).
      // NetworkOnly ensures authenticated PII (friends, tokens, access logs,
      // learning data) is fetched fresh every time and never persisted to disk.
      // Placed before the general api-cache rule so it takes precedence.
      {
        matcher: ({ url }) => isSensitiveApiPath(url.pathname),
        handler: new NetworkOnly(),
      },
      // Strategy 5b: Other API Requests (excluding real-time monitoring
      // endpoints and the sensitive paths handled above).
      {
        matcher: ({ url }) =>
          url.pathname.startsWith('/api/') &&
          !url.pathname.startsWith('/api/health') &&
          !url.pathname.startsWith('/api/metrics') &&
          !url.pathname.startsWith('/api/readiness') &&
          !isSensitiveApiPath(url.pathname),
        handler: new NetworkFirst({
          cacheName: API_CACHE_NAME,
          networkTimeoutSeconds: 10,
          plugins: [
            new ExpirationPlugin({
              maxEntries: 100,
              maxAgeSeconds: 60 * 60, // 1 hour
            }),
            new CacheableResponsePlugin({
              statuses: [0, 200],
            }),
          ],
        }),
      },
      ...defaultCache,
    ],
  });

  serwist.addEventListeners();

  // Logout cache purge (M-3): the app posts { type: 'CLEAR_API_CACHE' } on
  // logout so any benign API responses cached while authenticated are dropped
  // when the session ends. Sensitive endpoints are never cached (see 5a), but
  // this guarantees the whole api-cache is emptied on sign-out regardless.
  self.addEventListener('message', (event) => {
    if (event.data?.type === 'CLEAR_API_CACHE') {
      event.waitUntil(
        caches.delete(API_CACHE_NAME).catch((error) => {
          console.error('[ServiceWorker] Failed to clear API cache', error);
        })
      );
    }
  });
} catch (error) {
  console.error('[ServiceWorker] Initialization failed', error);
  // Fallback: basic fetch passthrough (app works without caching)
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });
}
