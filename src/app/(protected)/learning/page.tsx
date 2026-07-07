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
 * Learning — grading page (mobile-first, the primary flow)
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
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Review" description="番組で出題された内容をふりかえる" />
        <div className="flex flex-shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/learning/items">
              <ListChecks className="mr-1 h-4 w-4" />
              Tracker
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/learning/books">
              <BookOpen className="mr-1 h-4 w-4" />
              Books
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {isLoading && (
        <div className="mx-auto w-full max-w-xl">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}

      {!isLoading && !error && (
        <GradingDeck
          reviews={reviews}
          onGrade={(logId, result) => grade({ logId, result })}
        />
      )}
    </div>
  );
}
