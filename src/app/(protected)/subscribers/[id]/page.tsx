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
import { formatRelativeTime } from '@/lib/utils/formatDate';

/**
 * Friend detail page
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
    { label: 'Friends', href: '/subscribers' },
    { label: subscriber?.name || 'Loading...', href: undefined },
  ];

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Not Found State */}
      {!isLoading && !error && !subscriber && (
        <EmptyState
          title="Friend not found"
          description="This friend doesn't exist or has been removed."
          icon={<UserRound className="h-12 w-12" />}
          action={
            <Button asChild variant="outline">
              <Link href="/subscribers">Back to Friends</Link>
            </Button>
          }
        />
      )}

      {/* Detail */}
      {!isLoading && !error && subscriber && (
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Profile card */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-4">
              <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
                {subscriber.name}
                {subscriber.active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Deactivated</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                {subscriber.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setIsDeactivateOpen(true)}
                  >
                    <UserRoundX className="mr-1 h-4 w-4" />
                    Deactivate
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {subscriber.email && (
                <p>
                  <span className="text-muted-foreground">Email: </span>
                  {subscriber.email}
                </p>
              )}
              {subscriber.note && (
                <p>
                  <span className="text-muted-foreground">Note: </span>
                  {subscriber.note}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Added {formatRelativeTime(subscriber.created_at)}
                {subscriber.deactivated_at && (
                  <> · Deactivated {formatRelativeTime(subscriber.deactivated_at)}</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Token management */}
          <TokenSection subscriber={subscriber} />

          {/* Recent accesses */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-primary" aria-hidden="true" />
                Recent Accesses
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/access-logs?subscriber=${subscriber.id}`}>View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {logsError && <ErrorMessage error={logsError} />}
              {logsLoading && <Skeleton className="h-24 w-full" />}
              {!logsLoading && !logsError && <AccessLogList logs={logs} hideSubscriber />}
            </CardContent>
          </Card>

          {/* Back */}
          <div className="pt-2">
            <Button asChild variant="ghost" className="gap-2">
              <Link href="/subscribers">
                <ArrowLeft className="h-4 w-4" />
                Back to Friends
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
