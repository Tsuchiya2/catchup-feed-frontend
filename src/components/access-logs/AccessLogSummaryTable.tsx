/**
 * AccessLogSummaryTable Component
 *
 * Per-friend access summary with neglect detection front and center:
 * friends who never accessed the feed or have been silent for weeks are
 * sorted to the top and flagged with a colored badge. Plain table +
 * badges by design (right-sized: no chart library).
 */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { getNeglectStatus, sortByAttention, type NeglectLevel } from '@/utils/accessLog';
import type { AccessLogSummary } from '@/types/api';

interface AccessLogSummaryTableProps {
  /** Summary rows (one per friend) */
  summaries: AccessLogSummary[];
  /** Callback when a row is selected (used to filter the timeline) */
  onSelectSubscriber?: (subscriberId: number) => void;
}

const BADGE_VARIANT: Record<NeglectLevel, 'success' | 'default' | 'destructive' | 'secondary'> = {
  ok: 'success',
  warn: 'default',
  alert: 'destructive',
  never: 'destructive',
  deactivated: 'secondary',
};

/**
 * AccessLogSummaryTable - who is still listening, at a glance.
 */
export function AccessLogSummaryTable({
  summaries,
  onSelectSubscriber,
}: AccessLogSummaryTableProps) {
  const sorted = React.useMemo(() => sortByAttention(summaries), [summaries]);

  if (summaries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No friends registered yet. Add friends and issue tokens to start tracking.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm" aria-label="Access summary per friend">
        <thead>
          <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-3 py-2">
              Friend
            </th>
            <th scope="col" className="px-3 py-2">
              Status
            </th>
            <th scope="col" className="px-3 py-2">
              Last access
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              7d
            </th>
            <th scope="col" className="px-3 py-2 text-right">
              30d
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((summary) => {
            const status = getNeglectStatus(summary);
            const needsAttention = status.level === 'alert' || status.level === 'never';
            return (
              <tr
                key={summary.subscriber_id}
                className={`border-b border-border/30 transition-colors hover:bg-accent/50 ${
                  needsAttention ? 'bg-destructive/5' : ''
                } ${onSelectSubscriber ? 'cursor-pointer' : ''}`}
                onClick={() => onSelectSubscriber?.(summary.subscriber_id)}
                data-testid={`summary-row-${summary.subscriber_id}`}
              >
                <td className="px-3 py-3 font-medium">{summary.subscriber_name}</td>
                <td className="px-3 py-3">
                  <Badge variant={BADGE_VARIANT[status.level]}>{status.label}</Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {summary.last_accessed_at ? formatRelativeTime(summary.last_accessed_at) : '—'}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{summary.count_7d}</td>
                <td className="px-3 py-3 text-right tabular-nums">{summary.count_30d}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
