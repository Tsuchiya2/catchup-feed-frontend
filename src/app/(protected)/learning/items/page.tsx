'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LearningItemCard } from '@/components/learning/LearningItemCard';
import { useLearningItems, useRetireItem } from '@/hooks/useLearning';
import type { LearningItem, LearningItemStatus } from '@/types/api';

const TABS: ReadonlyArray<{ value: LearningItemStatus; label: string }> = [
  { value: 'active', label: '追跡中' },
  { value: 'retired', label: '卒業' },
];

/**
 * Learning — tracker (理解トラッカー) — 放送卓(改訂版)
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
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      <PageHeader
        title="トラッカー"
        description="学習項目の定着ぐあいを見る"
        action={
          <Button asChild variant="ghost" size="sm" className="text-console-ink-weak">
            <Link href="/learning">
              <ArrowLeft className="mr-1 h-4 w-4" />
              復習へ戻る
            </Link>
          </Button>
        }
      />

      {/* Status tabs — filled selection, no rounding (README ナビゲーション) */}
      <div
        className="inline-flex self-start border border-console-line-2 bg-console-panel"
        role="tablist"
        aria-label="項目の状態"
      >
        {TABS.map((tab, i) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'min-h-[40px] px-4 text-[13px] transition-colors duration-[120ms] ease-out focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-console-cyan',
                i > 0 && 'border-l border-console-line-2',
                isActive
                  ? 'bg-console-sel-bg text-console-sel-ink'
                  : 'text-console-ink-sub hover:bg-console-hover'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {isLoading && (
        <div className="border border-console-line-2 bg-console-panel" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
            >
              <span className="w-[44px] shrink-0 font-mono text-[10.5px] text-console-ink-ghost">
                —
              </span>
              <span className="min-h-[34px] flex-1" />
            </div>
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
          icon={<ListChecks className="h-10 w-10" />}
        />
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="border border-console-line-2 bg-console-panel" role="list">
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
