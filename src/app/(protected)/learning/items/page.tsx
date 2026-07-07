'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LearningItemCard } from '@/components/learning/LearningItemCard';
import { useLearningItems, useRetireItem } from '@/hooks/useLearning';
import type { LearningItem, LearningItemStatus } from '@/types/api';

const TABS: ReadonlyArray<{ value: LearningItemStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'retired', label: 'Graduated' },
];

/**
 * Learning — tracker (理解トラッカー)
 *
 * Active tab: current items with stage, next scheduled date, and history.
 * Graduated tab: archived / completed items (read-only).
 *
 * A plain, quiet list: overdue items are never colored or counted (§8.2).
 */
export default function LearningItemsPage() {
  const [status, setStatus] = React.useState<LearningItemStatus>('active');
  const { items, isLoading, error, refetch } = useLearningItems(status);
  const { mutateAsync: retire, isPending: isRetiring } = useRetireItem();

  const handleRetire = React.useCallback(
    async (item: LearningItem) => {
      if (isRetiring) {
        return;
      }
      try {
        await retire(item.id);
      } catch {
        // Surfaced via the hook's error state on the next render if needed;
        // retire is idempotent, so a retry is always safe.
      }
    },
    [retire, isRetiring]
  );

  return (
    <div className="container py-8">
      <div className="mb-2">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/learning">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Review
          </Link>
        </Button>
      </div>

      <PageHeader title="Tracker" description="学習項目の定着ぐあいを見る" />

      {/* Status tabs */}
      <div
        className="mb-6 inline-flex rounded-lg border border-border/60 bg-background/40 p-1"
        role="tablist"
        aria-label="Item status"
      >
        {TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          title={status === 'active' ? 'まだ学習項目はありません' : '卒業した項目はまだありません'}
          description={
            status === 'active'
              ? '番組で出題された内容が、ここに項目として貯まっていきます。'
              : 'ラダーを完走した項目や、手動でしまった項目がここに並びます。'
          }
          icon={<ListChecks className="h-12 w-12" />}
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2" role="list">
          {items.map((item) => (
            <LearningItemCard
              key={item.id}
              item={item}
              onRetire={status === 'active' ? handleRetire : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
