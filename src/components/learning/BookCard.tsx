/**
 * BookCard Component
 *
 * One ingested book in the book manager (D-20). Shows the title, review
 * status, and progress (review_cursor / total_chunks), with a single
 * activate / deactivate toggle.
 *
 * At most one book is active at a time; activating another book is an
 * implicit swap handled by the backend. Activating a finished book restarts
 * the read — no special confirmation, just the activate button (§8.2).
 */
'use client';

import * as React from 'react';
import { BookOpen, Play, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BOOK_STATUS_LABELS, LEARNING_TEST_IDS } from '@/constants/learning';
import type { LearningBook, BookReviewStatus } from '@/types/api';

interface BookCardProps {
  /** The book to display */
  book: LearningBook;
  /** Activate this book (set as the single in-progress book) */
  onActivate: (book: LearningBook) => void;
  /** Deactivate this book (pause, keep cursor) */
  onDeactivate: (book: LearningBook) => void;
  /** Disable actions while a book mutation is in flight */
  disabled?: boolean;
}

const STATUS_VARIANT: Record<BookReviewStatus, 'success' | 'secondary' | 'default'> = {
  active: 'success',
  finished: 'default',
  idle: 'secondary',
};

function progressPercent(cursor: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((cursor / total) * 100));
}

/**
 * BookCard — title, progress bar, and an activate/deactivate toggle.
 */
export const BookCard = React.memo(function BookCard({
  book,
  onActivate,
  onDeactivate,
  disabled = false,
}: BookCardProps) {
  const status = (book.review_status ?? 'idle') as BookReviewStatus;
  const isActive = status === 'active';
  const percent = progressPercent(book.review_cursor, book.total_chunks);

  return (
    <Card
      className={cn('flex flex-col', isActive && 'border-primary/40')}
      data-testid={LEARNING_TEST_IDS.BOOK}
      role="listitem"
      aria-label={`Book: ${book.title}`}
    >
      <CardContent className="flex flex-col gap-4 p-5">
        {/* Title + status */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-foreground">{book.title}</h3>
            <Badge variant={STATUS_VARIANT[status]} className="mt-1">
              {BOOK_STATUS_LABELS[status] ?? status}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {book.review_cursor} / {book.total_chunks} ({percent}%)
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${book.title} progress`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Toggle */}
        <div className="flex justify-end">
          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(book)}
              disabled={disabled}
              data-testid={LEARNING_TEST_IDS.BOOK_TOGGLE}
              aria-label={`Pause ${book.title}`}
            >
              <Pause className="mr-1 h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onActivate(book)}
              disabled={disabled}
              data-testid={LEARNING_TEST_IDS.BOOK_TOGGLE}
              aria-label={`Activate ${book.title}`}
            >
              <Play className="mr-1 h-4 w-4" />
              {status === 'finished' ? 'Re-read' : 'Activate'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
