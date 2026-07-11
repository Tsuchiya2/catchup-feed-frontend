/**
 * Safe External Href Utility
 *
 * Guards against `javascript:` / `data:` scheme XSS when rendering
 * externally-sourced URLs (feed_url, article url) into an `href`.
 *
 * External data (RSS feeds, crawled articles) is untrusted. A value like
 * `javascript:alert(document.cookie)` placed directly into an `<a href>` runs
 * on click. This helper parses the URL and only returns it when the scheme is
 * `http:` or `https:`; anything else (or an unparseable value) yields
 * `undefined`, so the caller can omit the `href` entirely.
 *
 * @module lib/utils/safeExternalHref
 */

/**
 * Schemes allowed for external navigation links.
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Returns the URL unchanged when it is a safe (http/https) external link,
 * otherwise `undefined`.
 *
 * Callers should treat `undefined` as "do not render an href" (or render a
 * non-interactive element), which neutralizes `javascript:` / `data:` / other
 * dangerous schemes.
 *
 * @param url - Externally-sourced URL string (may be undefined/null)
 * @returns The original URL if it uses http/https, otherwise undefined
 *
 * @example
 * safeExternalHref('https://example.com/feed')   // 'https://example.com/feed'
 * safeExternalHref('http://example.com')          // 'http://example.com'
 * safeExternalHref('javascript:alert(1)')         // undefined
 * safeExternalHref('data:text/html,<script>')     // undefined
 * safeExternalHref('not a url')                    // undefined
 * safeExternalHref(undefined)                      // undefined
 */
export function safeExternalHref(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return url;
    }
    return undefined;
  } catch {
    // URL constructor throws on malformed / relative / schemeless input.
    return undefined;
  }
}
