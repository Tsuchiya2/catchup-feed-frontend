'use client';

import * as React from 'react';
import { Plus, UsersRound } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { SubscriberCard } from '@/components/subscribers/SubscriberCard';
import { AddSubscriberDialog } from '@/components/subscribers/AddSubscriberDialog';
import { EditSubscriberDialog } from '@/components/subscribers/EditSubscriberDialog';
import { DeactivateSubscriberDialog } from '@/components/subscribers/DeactivateSubscriberDialog';
import { useSubscribers } from '@/hooks/useSubscribers';
import type { Subscriber } from '@/types/api';

/**
 * Friends (subscribers) list page — 放送卓(改訂版)
 *
 * CRUD for the friends receiving the radio feed, as a console row list.
 * Deletion is a soft delete (deactivation) — deactivated friends stay in
 * the list, dimmed, so their history remains visible.
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
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      {/* Page Header with Add button */}
      <PageHeader
        title="友人"
        description={
          isLoading
            ? '— 名'
            : `有効 ${activeCount} 名${inactiveCount > 0 ? ` ／ 無効化 ${inactiveCount} 名` : ''}`
        }
        action={
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            友人を追加
          </Button>
        }
      />

      {/* Error State */}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Loading State */}
      {isLoading && (
        <div className="border border-console-line-2 bg-console-panel" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
            >
              <span className="min-h-[34px] flex-1" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && subscribers.length === 0 && (
        <EmptyState
          title="友人はまだいません"
          description="友人を追加してから、管理画面で購読トークンを発行してください。"
          icon={<UsersRound className="h-10 w-10" />}
          action={
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              友人を追加
            </Button>
          }
        />
      )}

      {/* Friends list */}
      {!isLoading && !error && subscribers.length > 0 && (
        <div className="border border-console-line-2 bg-console-panel" role="list">
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
