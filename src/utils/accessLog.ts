/**
 * Access log utilities
 *
 * Neglect detection: the point of the access log screen is spotting
 * friends who quietly stopped listening (e.g. no access for 3 weeks),
 * because the project optimizes for feedback, not delivery counts.
 */

import { ACCESS_LOG_THRESHOLDS } from '@/constants/subscriber';
import type { AccessLogSummary } from '@/types/api';

/**
 * Neglect status levels, in increasing severity:
 * - ok:          accessed recently
 * - warn:        no access for WARN_DAYS (14) or more
 * - alert:       no access for ALERT_DAYS (21) or more
 * - never:       has never accessed the feed
 * - deactivated: friend is deactivated (excluded from neglect detection)
 */
export type NeglectLevel = 'ok' | 'warn' | 'alert' | 'never' | 'deactivated';

export interface NeglectStatus {
  level: NeglectLevel;
  /** Short badge label, e.g. "3w+ silent" */
  label: string;
}

/**
 * Classify a summary row for the neglect badge.
 */
export function getNeglectStatus(summary: AccessLogSummary): NeglectStatus {
  if (!summary.active) {
    return { level: 'deactivated', label: 'Deactivated' };
  }

  const days = summary.days_since_last_access;

  // Note: the two fields are expected to be null together. A contradictory
  // row (e.g. days_since_last_access set but last_accessed_at null, or vice
  // versa) is deliberately classified as 'never' — the conservative reading
  // that surfaces the row for attention rather than hiding a data bug.
  if (days === null || summary.last_accessed_at === null) {
    return { level: 'never', label: 'Never accessed' };
  }

  if (days >= ACCESS_LOG_THRESHOLDS.ALERT_DAYS) {
    return { level: 'alert', label: `${days}d silent` };
  }

  if (days >= ACCESS_LOG_THRESHOLDS.WARN_DAYS) {
    return { level: 'warn', label: `${days}d quiet` };
  }

  return { level: 'ok', label: days === 0 ? 'Today' : `${days}d ago` };
}

/**
 * Sort summaries so the rows needing attention come first:
 * never accessed, then longest silence, then the rest. Deactivated
 * friends sink to the bottom.
 */
export function sortByAttention(summaries: AccessLogSummary[]): AccessLogSummary[] {
  const rank = (s: AccessLogSummary): number => {
    const status = getNeglectStatus(s);
    switch (status.level) {
      case 'never':
        return 0;
      case 'alert':
        return 1;
      case 'warn':
        return 2;
      case 'ok':
        return 3;
      case 'deactivated':
        return 4;
    }
  };

  return [...summaries].sort((a, b) => {
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    // Within the same rank, longer silence first
    return (b.days_since_last_access ?? 0) - (a.days_since_last_access ?? 0);
  });
}
