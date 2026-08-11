/**
 * AccessLogSummaryTable Component — console table (放送卓改訂版).
 *
 * Per-friend access summary with neglect detection front and center:
 * friends who never accessed the feed or have been silent for weeks are
 * sorted to the top and flagged with a bordered label (fills are never
 * used for state). Numbers and dates are mono. Warning color is the
 * console warm tone — red stays reserved for destructive confirmation.
 */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { getNeglectStatus, sortByAttention, type NeglectLevel } from '@/utils/accessLog';
import type { AccessLogSummary } from '@/types/api';

interface AccessLogSummaryTableProps {
  /** Summary rows (one per friend) */
  summaries: AccessLogSummary[];
  /** Callback when a row is selected (used to filter the timeline) */
  onSelectSubscriber?: (subscriberId: number) => void;
}

const BADGE_VARIANT: Record<NeglectLevel, 'success' | 'warn' | 'secondary'> = {
  ok: 'success',
  warn: 'warn',
  alert: 'warn',
  never: 'warn',
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
      <p className="py-6 text-center text-[12.5px] text-console-ink-weak">
        友人はまだ登録されていません。友人を追加してトークンを発行すると、ここに集計されます。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-[13px]" aria-label="友人ごとのアクセス集計">
        <thead>
          <tr className="border-b border-console-line-2 text-left font-mono text-[10.5px] tracking-[.18em] text-console-ink-faint">
            <th scope="col" className="px-3 py-2 font-normal">
              友人
            </th>
            <th scope="col" className="px-3 py-2 font-normal">
              状態
            </th>
            <th scope="col" className="px-3 py-2 font-normal">
              最終アクセス
            </th>
            <th scope="col" className="px-3 py-2 text-right font-normal">
              7D
            </th>
            <th scope="col" className="px-3 py-2 text-right font-normal">
              30D
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((summary) => {
            const status = getNeglectStatus(summary);
            return (
              <tr
                key={summary.subscriber_id}
                className={`border-b border-console-line-1 transition-colors duration-[120ms] ease-out last:border-b-0 hover:bg-console-hover ${
                  onSelectSubscriber ? 'cursor-pointer' : ''
                }`}
                onClick={() => onSelectSubscriber?.(summary.subscriber_id)}
                data-testid={`summary-row-${summary.subscriber_id}`}
              >
                <td className="px-3 py-3 text-console-ink">{summary.subscriber_name}</td>
                <td className="px-3 py-3">
                  <Badge variant={BADGE_VARIANT[status.level]}>{status.label}</Badge>
                </td>
                <td className="px-3 py-3 font-mono text-[11px] text-console-ink-weak">
                  {summary.last_accessed_at ? formatRelativeTimeJa(summary.last_accessed_at) : '—'}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-console-ink-sub">
                  {summary.count_7d}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-console-ink-sub">
                  {summary.count_30d}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
