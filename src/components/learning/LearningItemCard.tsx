/**
 * LearningItemCard Component
 *
 * One row in the理解トラッカー. Shows the concept, a kind badge
 * (article / book), the spaced-repetition stage, the next scheduled date,
 * and a compact history summary (times asked + last result). Active items
 * carry a manual retire action ("もう追わなくていい").
 *
 * Calm by design: the due date is shown plainly with NO overdue warning
 * color, and there is no "N days late" framing (§8.2 禁止事項).
 */
'use client';

import * as React from 'react';
import { Archive, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/formatDate';
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
 * LearningItemCard — a single tracked item.
 */
export const LearningItemCard = React.memo(function LearningItemCard({
  item,
  onRetire,
}: LearningItemCardProps) {
  const isBook = item.kind === 'book';
  const isRetired = item.retired_at !== null;

  return (
    <Card
      className={cn('flex flex-col', isRetired && 'opacity-70')}
      data-testid={LEARNING_TEST_IDS.ITEM}
      role="listitem"
      aria-label={`Item: ${item.concept}`}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        {/* Concept + kind badge */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            {isBook ? (
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-foreground">{item.concept}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{isBook ? 'Book' : 'Article'}</Badge>
              <Badge variant="secondary">Stage {item.stage}</Badge>
            </div>
          </div>
        </div>

        {/* Meta: schedule + history */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          {!isRetired && (
            <div>
              <dt className="text-xs text-muted-foreground">Next</dt>
              <dd className="text-foreground">{item.due_on || '—'}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted-foreground">Asked</dt>
            <dd className="text-foreground">{item.times_asked}×</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Last</dt>
            <dd className="text-foreground">
              {item.last_result ? (RESULT_LABEL[item.last_result] ?? item.last_result) : '—'}
            </dd>
          </div>
          {isRetired && item.retired_at && (
            <div>
              <dt className="text-xs text-muted-foreground">Retired</dt>
              <dd className="text-foreground">{formatRelativeTime(item.retired_at)}</dd>
            </div>
          )}
        </dl>

        {/* Retire action (active only) */}
        {!isRetired && onRetire && (
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onRetire(item)}
              data-testid={LEARNING_TEST_IDS.RETIRE_BUTTON}
              aria-label={`Retire item: ${item.concept}`}
            >
              <Archive className="mr-1 h-4 w-4" />
              Retire
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
