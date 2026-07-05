'use client';

import * as React from 'react';
import { Plus, UsersRound } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SubscriberCard } from '@/components/subscribers/SubscriberCard';
import { AddSubscriberDialog } from '@/components/subscribers/AddSubscriberDialog';
import { EditSubscriberDialog } from '@/components/subscribers/EditSubscriberDialog';
import { DeactivateSubscriberDialog } from '@/components/subscribers/DeactivateSubscriberDialog';
import { useSubscribers } from '@/hooks/useSubscribers';
import type { Subscriber } from '@/types/api';

/**
 * Friends (subscribers) list page
 *
 * CRUD for the friends receiving the radio feed. Deletion is a soft
 * delete (deactivation) — deactivated friends stay in the list, greyed
 * out, so their history remains visible.
 */
export default function SubscribersPage() {
  const { subscribers, isLoading, error, refetch } = useSubscribers();

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [subscriberToEdit, setSubscriberToEdit] = React.useState<Subscriber | null>(null);
  const [subscriberToDeactivate, setSubscriberToDeactivate] = React.useState<Subscriber | null>(
    null
  );

  const activeCount = subscribers.filter((s) => s.active).length;
  const inactiveCount = subscribers.length - activeCount;

  return (
    <div className="container py-8">
      {/* Page Header with Add button */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Friends"
          description={
            subscribers.length > 0
              ? `${activeCount} active${inactiveCount > 0 ? `, ${inactiveCount} deactivated` : ''}`
              : 'Friends subscribing to the radio feed'
          }
        />
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && subscribers.length === 0 && (
        <EmptyState
          title="No friends yet"
          description="Add a friend, then issue their subscription token from the Manage screen."
          icon={<UsersRound className="h-12 w-12" />}
          action={
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          }
        />
      )}

      {/* Friends grid */}
      {!isLoading && !error && subscribers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {subscribers.map((subscriber) => (
            <SubscriberCard
              key={subscriber.id}
              subscriber={subscriber}
              onEdit={setSubscriberToEdit}
              onDeactivate={setSubscriberToDeactivate}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddSubscriberDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditSubscriberDialog
        subscriber={subscriberToEdit}
        isOpen={subscriberToEdit !== null}
        onClose={() => setSubscriberToEdit(null)}
      />
      <DeactivateSubscriberDialog
        subscriber={subscriberToDeactivate}
        isOpen={subscriberToDeactivate !== null}
        onClose={() => setSubscriberToDeactivate(null)}
      />
    </div>
  );
}
