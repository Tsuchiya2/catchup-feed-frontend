import { describe, it, expect } from 'vitest';
import { safeExternalHref } from './safeExternalHref';

describe('safeExternalHref', () => {
  it('returns https URLs unchanged', () => {
    expect(safeExternalHref('https://example.com/feed.xml')).toBe('https://example.com/feed.xml');
  });

  it('returns http URLs unchanged', () => {
    expect(safeExternalHref('http://example.com/rss')).toBe('http://example.com/rss');
  });

  it('preserves query strings and fragments on valid URLs', () => {
    const url = 'https://www.youtube.com/feeds/videos.xml?channel_id=abc#frag';
    expect(safeExternalHref(url)).toBe(url);
  });

  it('rejects javascript: scheme', () => {
    expect(safeExternalHref('javascript:alert(document.cookie)')).toBeUndefined();
  });

  it('rejects javascript: scheme regardless of casing', () => {
    expect(safeExternalHref('JavaScript:alert(1)')).toBeUndefined();
  });

  it('rejects data: scheme', () => {
    expect(safeExternalHref('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('rejects vbscript: scheme', () => {
    expect(safeExternalHref('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('rejects file: scheme', () => {
    expect(safeExternalHref('file:///etc/passwd')).toBeUndefined();
  });

  it('returns undefined for unparseable / relative input', () => {
    expect(safeExternalHref('not a url')).toBeUndefined();
    expect(safeExternalHref('/relative/path')).toBeUndefined();
    expect(safeExternalHref('example.com')).toBeUndefined();
  });

  it('returns undefined for empty, null, and undefined input', () => {
    expect(safeExternalHref('')).toBeUndefined();
    expect(safeExternalHref(null)).toBeUndefined();
    expect(safeExternalHref(undefined)).toBeUndefined();
  });
});
