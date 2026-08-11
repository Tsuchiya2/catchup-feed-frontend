'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, History, Pencil, UserRound, UserRoundX } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenSection } from '@/components/subscribers/TokenSection';
import { EditSubscriberDialog } from '@/components/subscribers/EditSubscriberDialog';
import { DeactivateSubscriberDialog } from '@/components/subscribers/DeactivateSubscriberDialog';
import { AccessLogList } from '@/components/access-logs/AccessLogList';
import { useSubscriber } from '@/hooks/useSubscribers';
import { useAccessLogs } from '@/hooks/useAccessLogs';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';

/**
 * Friend detail page — 放送卓(改訂版)
 *
 * - Profile (name / email / note / status)
 * - Feed token management (issue with one-time URL display, revoke)
 * - Recent accesses by this friend
 */
export default function SubscriberDetailPage() {
  const params = useParams<{ id: string }>();
  const subscriberId = parseInt(params.id || '0', 10);

  const { subscriber, isLoading, error, refetch } = useSubscriber(subscriberId);
  const {
    logs,
    isLoading: logsLoading,
    error: logsError,
  } = useAccessLogs({ subscriber_id: subscriberId, limit: 20 }, { enabled: subscriberId > 0 });

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);

  const breadcrumbItems = [
    { label: '友人', href: '/subscribers' },
    { label: subscriber?.name || '読み込み中…', href: undefined },
  ];

  return (
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      <Breadcrumb items={breadcrumbItems} className="mb-0" />

      {/* Error State */}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Loading State */}
      {isLoading && (
        <div className="mx-auto w-full max-w-3xl space-y-5">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Not Found State */}
      {!isLoading && !error && !subscriber && (
        <EmptyState
          title="友人が見つかりません"
          description="この友人は存在しないか、すでに削除されています。"
          icon={<UserRound className="h-10 w-10" />}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/subscribers">友人一覧に戻る</Link>
            </Button>
          }
        />
      )}

      {/* Detail */}
      {!isLoading && !error && subscriber && (
        <div className="mx-auto w-full max-w-3xl space-y-5">
          {/* Profile panel */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-console-line-1 pb-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[15px] font-bold text-console-ink">{subscriber.name}</span>
                {subscriber.active ? (
                  <Badge variant="success">有効</Badge>
                ) : (
                  <Badge variant="secondary">無効化済</Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  編集
                </Button>
                {subscriber.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeactivateOpen(true)}
                  >
                    <UserRoundX className="mr-1 h-4 w-4" />
                    無効化
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-[13px] leading-[1.9]">
              {subscriber.email && (
                <p>
                  <span className="font-mono text-[11px] tracking-[.12em] text-console-ink-faint">
                    EMAIL{' '}
                  </span>
                  <span className="font-mono text-[12px] text-console-ink-sub">
                    {subscriber.email}
                  </span>
                </p>
              )}
              {subscriber.note && (
                <p className="text-console-ink-sub">
                  <span className="font-mono text-[11px] tracking-[.12em] text-console-ink-faint">
                    メモ{' '}
                  </span>
                  {subscriber.note}
                </p>
              )}
              <p className="font-mono text-[10.5px] text-console-ink-faint">
                追加 {formatRelativeTimeJa(subscriber.created_at)}
                {subscriber.deactivated_at && (
                  <> ／ 無効化 {formatRelativeTimeJa(subscriber.deactivated_at)}</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Token management */}
          <TokenSection subscriber={subscriber} />

          {/* Recent accesses */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-console-line-1 pb-3">
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" aria-hidden="true" />
                最近のアクセス
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/access-logs?subscriber=${subscriber.id}`}>すべて見る</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {logsError && <ErrorMessage error={logsError} />}
              {logsLoading && <Skeleton className="h-24 w-full" />}
              {!logsLoading && !logsError && <AccessLogList logs={logs} hideSubscriber />}
            </CardContent>
          </Card>

          {/* Back */}
          <div className="pt-1">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/subscribers">
                <ArrowLeft className="h-4 w-4" />
                友人一覧に戻る
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {subscriber && (
        <>
          <EditSubscriberDialog
            subscriber={subscriber}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          />
          <DeactivateSubscriberDialog
            subscriber={subscriber}
            isOpen={isDeactivateOpen}
            onClose={() => setIsDeactivateOpen(false)}
          />
        </>
      )}
    </div>
  );
}
