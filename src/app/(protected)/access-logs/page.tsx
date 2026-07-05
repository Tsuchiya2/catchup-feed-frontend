'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, History } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AccessLogSummaryTable } from '@/components/access-logs/AccessLogSummaryTable';
import { AccessLogList } from '@/components/access-logs/AccessLogList';
import { useAccessLogs, useAccessLogSummary } from '@/hooks/useAccessLogs';
import { useSubscribers } from '@/hooks/useSubscribers';

/**
 * Access Logs page content
 *
 * Top: per-friend summary with neglect detection (friends who never
 * accessed the feed or have been silent for 2-3+ weeks float to the top
 * with a colored badge — the project goal is feedback, so spotting
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
    <div className="container py-8">
      <PageHeader title="Access Logs" description="Who is still listening — and who went quiet" />

      {/* Summary: neglect detection */}
      <Card className="mb-6 mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            Per-friend Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            Timeline
          </CardTitle>
          {/* Friend filter */}
          <div className="flex items-center gap-2">
            <Label htmlFor="subscriber-filter" className="whitespace-nowrap text-sm">
              Friend
            </Label>
            <select
              id="subscriber-filter"
              value={validSubscriberId ?? ''}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex h-10 w-full min-w-[10rem] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Filter timeline by friend"
            >
              <option value="">All friends</option>
              {subscribers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {logsResult.error && (
            <ErrorMessage error={logsResult.error} onRetry={logsResult.refetch} />
          )}
          {logsResult.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
        <div className="container py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AccessLogsPageContent />
    </Suspense>
  );
}
