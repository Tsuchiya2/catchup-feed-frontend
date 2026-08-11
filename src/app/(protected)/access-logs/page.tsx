'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessLogSummaryTable } from '@/components/access-logs/AccessLogSummaryTable';
import { AccessLogList } from '@/components/access-logs/AccessLogList';
import { useAccessLogs, useAccessLogSummary } from '@/hooks/useAccessLogs';
import { useSubscribers } from '@/hooks/useSubscribers';

/**
 * Access Logs page — 放送卓(改訂版)
 *
 * Top: per-friend summary with neglect detection (friends who never
 * accessed the feed or have been silent for 2-3+ weeks float to the top
 * with a bordered warm label — the project goal is feedback, so spotting
 * silence matters more than raw counts).
 *
 * Bottom: chronological access timeline, filterable by friend
 * (?subscriber=<id> is linkable from the friend detail page).
 */
function AccessLogsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const subscriberParam = searchParams.get('subscriber');
  const subscriberId = subscriberParam ? parseInt(subscriberParam, 10) : undefined;
  const validSubscriberId =
    subscriberId !== undefined && Number.isFinite(subscriberId) && subscriberId > 0
      ? subscriberId
      : undefined;

  const summaryResult = useAccessLogSummary();
  const logsResult = useAccessLogs({
    subscriber_id: validSubscriberId,
    limit: 100,
  });
  const { subscribers } = useSubscribers();

  const handleFilterChange = (value: string) => {
    router.push(value ? `/access-logs?subscriber=${value}` : '/access-logs');
  };

  return (
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      <PageHeader title="アクセスログ" description="誰がまだ聴いていて、誰が静かになったか" />

      {/* Summary: neglect detection */}
      <Card>
        <CardHeader className="border-b border-console-line-1 pb-3">
          <CardTitle>友人ごとの集計</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {summaryResult.error && (
            <ErrorMessage error={summaryResult.error} onRetry={summaryResult.refetch} />
          )}
          {summaryResult.isLoading && <Skeleton className="h-32 w-full" />}
          {!summaryResult.isLoading && !summaryResult.error && (
            <AccessLogSummaryTable
              summaries={summaryResult.summary}
              onSelectSubscriber={(id) => handleFilterChange(String(id))}
            />
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-console-line-1 pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>タイムライン</CardTitle>
          {/* Friend filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="subscriber-filter"
              className="whitespace-nowrap font-mono text-[11px] tracking-[.18em] text-console-ink-weak"
            >
              友人
            </label>
            <select
              id="subscriber-filter"
              value={validSubscriberId ?? ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="console-field h-9 w-full min-w-[10rem] text-[13px]"
              aria-label="タイムラインを友人で絞り込む"
            >
              <option value="">すべての友人</option>
              {subscribers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {logsResult.error && (
            <ErrorMessage error={logsResult.error} onRetry={logsResult.refetch} />
          )}
          {logsResult.isLoading && (
            <div className="space-y-2 py-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {!logsResult.isLoading && !logsResult.error && <AccessLogList logs={logsResult.logs} />}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Access Logs page (Suspense wrapper for useSearchParams)
 */
export default function AccessLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
          <PageHeader title="アクセスログ" description="—" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AccessLogsPageContent />
    </Suspense>
  );
}
