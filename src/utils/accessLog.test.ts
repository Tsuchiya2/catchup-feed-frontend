import { describe, it, expect } from 'vitest';
import { getNeglectStatus, sortByAttention } from './accessLog';
import type { AccessLogSummary } from '@/types/api';

function summary(overrides: Partial<AccessLogSummary> = {}): AccessLogSummary {
  return {
    subscriber_id: 1,
    subscriber_name: 'Taro',
    active: true,
    last_accessed_at: '2026-07-01T00:00:00Z',
    days_since_last_access: 1,
    count_7d: 3,
    count_30d: 10,
    ...overrides,
  };
}

describe('getNeglectStatus', () => {
  it('returns ok for a recent access', () => {
    const status = getNeglectStatus(summary({ days_since_last_access: 3 }));
    expect(status.level).toBe('ok');
    expect(status.label).toBe('3d ago');
  });

  it('labels same-day access as Today', () => {
    const status = getNeglectStatus(summary({ days_since_last_access: 0 }));
    expect(status.level).toBe('ok');
    expect(status.label).toBe('Today');
  });

  it('warns at 14 days of silence', () => {
    const status = getNeglectStatus(summary({ days_since_last_access: 14 }));
    expect(status.level).toBe('warn');
    expect(status.label).toContain('14d');
  });

  it('alerts at 21 days (3 weeks) of silence', () => {
    const status = getNeglectStatus(summary({ days_since_last_access: 21 }));
    expect(status.level).toBe('alert');
    expect(status.label).toContain('21d');
  });

  it('flags friends who never accessed the feed', () => {
    const status = getNeglectStatus(
      summary({ last_accessed_at: null, days_since_last_access: null })
    );
    expect(status.level).toBe('never');
    expect(status.label).toBe('Never accessed');
  });

  it('excludes deactivated friends from neglect detection', () => {
    const status = getNeglectStatus(summary({ active: false, days_since_last_access: 60 }));
    expect(status.level).toBe('deactivated');
  });
});

describe('sortByAttention', () => {
  it('sorts never > alert > warn > ok > deactivated', () => {
    const rows = [
      summary({ subscriber_id: 1, days_since_last_access: 2 }), // ok
      summary({ subscriber_id: 2, active: false, days_since_last_access: 90 }), // deactivated
      summary({ subscriber_id: 3, days_since_last_access: 30 }), // alert
      summary({ subscriber_id: 4, last_accessed_at: null, days_since_last_access: null }), // never
      summary({ subscriber_id: 5, days_since_last_access: 15 }), // warn
    ];

    const sorted = sortByAttention(rows).map((r) => r.subscriber_id);
    expect(sorted).toEqual([4, 3, 5, 1, 2]);
  });

  it('sorts longer silence first within the same rank', () => {
    const rows = [
      summary({ subscriber_id: 1, days_since_last_access: 22 }),
      summary({ subscriber_id: 2, days_since_last_access: 40 }),
    ];

    const sorted = sortByAttention(rows).map((r) => r.subscriber_id);
    expect(sorted).toEqual([2, 1]);
  });

  it('does not mutate the input array', () => {
    const rows = [
      summary({ subscriber_id: 1, days_since_last_access: 2 }),
      summary({ subscriber_id: 2, last_accessed_at: null, days_since_last_access: null }),
    ];
    const copy = [...rows];

    sortByAttention(rows);
    expect(rows).toEqual(copy);
  });
});
