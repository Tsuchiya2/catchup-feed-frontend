/**
 * LearningItemCard Component — one row of the 理解トラッカー (放送卓改訂版).
 *
 * Shows the concept, a kind label (article / book, mono), the
 * spaced-repetition stage, the next scheduled date, and a compact history
 * summary (times asked + last result). Active items carry a manual retire
 * action ("もう追わなくていい").
 *
 * Calm by design: the due date is shown plainly with NO overdue warning
 * color, and there is no "N days late" framing (§8.2 禁止事項).
 */
'use client';

import * as React from 'react';
import { Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { LEARNING_TEST_IDS } from '@/constants/learning';
import type { LearningItem } from '@/types/api';

interface LearningItemCardProps {
  /** The learning item to display */
  item: LearningItem;
  /** Called when the retire button is tapped (active items only) */
  onRetire?: (item: LearningItem) => void;
}

const RESULT_LABEL: Record<string, string> = {
  good: '○ わかった',
  fuzzy: '△ あいまい',
  forgot: '× 忘れた',
  auto: '自動前進',
};

/**
 * LearningItemCard — a single tracked item as a console list row.
 */
export const LearningItemCard = React.memo(function LearningItemCard({
  item,
  onRetire,
}: LearningItemCardProps) {
  const isBook = item.kind === 'book';
  const isRetired = item.retired_at !== null;

  return (
    <div
      role="listitem"
      aria-label={`項目: ${item.concept}`}
      data-testid={LEARNING_TEST_IDS.ITEM}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
    >
      <span
        aria-hidden="true"
        className="w-[44px] shrink-0 font-mono text-[10.5px] tracking-[.12em] text-console-violet"
      >
        {isBook ? 'BOOK' : 'ART'}
      </span>

      <div className="min-w-0 flex-1 basis-[220px]">
        <h3
          className={cn(
            'text-[13.5px] leading-[1.7]',
            isRetired ? 'text-console-ink-faint' : 'text-console-ink'
          )}
        >
          {item.concept}
        </h3>
        <p className="mt-0.5 font-mono text-[10.5px] text-console-ink-weak">
          STAGE {item.stage} ／ 出題 {item.times_asked}回 ／ 直近{' '}
          {item.last_result ? (RESULT_LABEL[item.last_result] ?? item.last_result) : '—'}
          {!isRetired && <> ／ 次回 {item.due_on || '—'}</>}
          {isRetired && item.retired_at && <> ／ 卒業 {formatRelativeTimeJa(item.retired_at)}</>}
        </p>
      </div>

      {isRetired && <Badge variant="secondary">卒業</Badge>}

      {/* Retire action (active only) */}
      {!isRetired && onRetire && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-console-ink-weak hover:text-console-ink"
          onClick={() => onRetire(item)}
          data-testid={LEARNING_TEST_IDS.RETIRE_BUTTON}
          aria-label={`項目をしまう: ${item.concept}`}
        >
          <Archive className="mr-1 h-4 w-4" />
          しまう
        </Button>
      )}
    </div>
  );
});
