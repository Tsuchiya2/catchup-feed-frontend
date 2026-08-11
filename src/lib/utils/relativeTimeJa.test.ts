import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTimeJa } from './relativeTimeJa';

describe('formatRelativeTimeJa', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-11T06:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns — for null, undefined, and invalid input', () => {
    expect(formatRelativeTimeJa(null)).toBe('—');
    expect(formatRelativeTimeJa(undefined)).toBe('—');
    expect(formatRelativeTimeJa('')).toBe('—');
    expect(formatRelativeTimeJa('not-a-date')).toBe('—');
  });

  it('returns — for clearly future dates', () => {
    expect(formatRelativeTimeJa('2026-08-11T07:00:00Z')).toBe('—');
  });

  it('formats sub-minute as たった今', () => {
    expect(formatRelativeTimeJa('2026-08-11T05:59:30Z')).toBe('たった今');
  });

  it('formats minutes', () => {
    expect(formatRelativeTimeJa('2026-08-11T05:18:00Z')).toBe('42分前');
  });

  it('formats hours', () => {
    expect(formatRelativeTimeJa('2026-08-10T19:00:00Z')).toBe('11時間前');
  });

  it('formats days below 30', () => {
    expect(formatRelativeTimeJa('2026-08-08T06:00:00Z')).toBe('3日前');
  });

  it('formats 30 days or older as YYYY.MM.DD', () => {
    expect(formatRelativeTimeJa('2026-06-01T06:00:00Z')).toBe('2026.06.01');
  });
});
