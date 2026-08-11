'use client';

import * as React from 'react';
import Link from 'next/link';
import { ListChecks, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GradingDeck } from '@/components/learning/GradingDeck';
import { usePendingReviews, useGradeReview } from '@/hooks/useLearning';

/**
 * Learning — grading page (mobile-first, the primary flow) — 放送卓(改訂版)
 *
 * Shows one pending review at a time: concept + question, tap to reveal the
 * answer, then ○ △ × to grade. Grading is optimistic so a batch of reviews
 * clears in a few quiet taps during細切れ時間.
 *
 * Deliberately calm: no counters, no overdue warnings, no streaks. An empty
 * queue is a good day, shown warmly ("今日は採点するものがありません").
 */
export default function LearningPage() {
  const { reviews, isLoading, error, refetch } = usePendingReviews();
  const { grade } = useGradeReview();

  return (
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      <PageHeader
        title="復習"
        description="番組で出題された内容をふりかえる"
        action={
          <div className="flex flex-shrink-0 gap-1.5">
            <Button asChild variant="outline" size="sm">
              <Link href="/learning/items">
                <ListChecks className="mr-1 h-4 w-4" />
                トラッカー
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/learning/books">
                <BookOpen className="mr-1 h-4 w-4" />
                書籍
              </Link>
            </Button>
          </div>
        }
      />

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {isLoading && (
        <div className="mx-auto w-full max-w-xl">
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && !error && (
        <GradingDeck reviews={reviews} onGrade={(logId, result) => grade({ logId, result })} />
      )}
    </div>
  );
}
