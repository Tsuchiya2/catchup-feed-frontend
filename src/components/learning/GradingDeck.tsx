/**
 * GradingDeck Component
 *
 * Drives the one-card-at-a-time grading flow. Progression is local and
 * instant: tapping a grade adds the card's log_id to a "processed" set so
 * the next card appears immediately, while the mutation runs in the
 * background (optimistic update, §8.2). A 409 (already graded elsewhere) is
 * absorbed by the mutation and the card stays skipped — no interruption.
 *
 * The visible deck = fetched reviews minus locally-processed ones, so the
 * deck stays stable even if the pending cache shifts underneath.
 */
'use client';

import * as React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ReviewCard } from '@/components/learning/ReviewCard';
import { LEARNING_TEST_IDS } from '@/constants/learning';
import type { PendingReview, GradeResult } from '@/types/api';

interface GradingDeckProps {
  /** The pending reviews fetched from the server (oldest first) */
  reviews: PendingReview[];
  /** Fire the grade mutation for a review */
  onGrade: (logId: number, result: GradeResult) => void;
}

/**
 * GradingDeck — shows the oldest un-processed card; advances on grade.
 */
export function GradingDeck({ reviews, onGrade }: GradingDeckProps) {
  // log_ids graded in this session. Drives instant advance and keeps the
  // deck stable regardless of cache churn.
  const [processed, setProcessed] = React.useState<ReadonlySet<number>>(() => new Set());

  const deck = React.useMemo(
    () => reviews.filter((r) => !processed.has(r.log_id)),
    [reviews, processed]
  );

  const current = deck[0];

  const handleGrade = React.useCallback(
    (result: GradeResult) => {
      if (!current) {
        return;
      }
      const logId = current.log_id;
      // Advance the UI first (optimistic), then fire the mutation.
      setProcessed((prev) => {
        const next = new Set(prev);
        next.add(logId);
        return next;
      });
      onGrade(logId, result);
    },
    [current, onGrade]
  );

  if (!current) {
    return (
      <div data-testid={LEARNING_TEST_IDS.EMPTY}>
        <EmptyState
          title="今日は採点するものがありません"
          description="また番組を聴いたら、ここに復習が並びます。"
          icon={<CheckCircle2 className="h-12 w-12 text-primary" />}
        />
      </div>
    );
  }

  return (
    // key on log_id resets the card's reveal state for each new card.
    <ReviewCard key={current.log_id} review={current} onGrade={handleGrade} />
  );
}
