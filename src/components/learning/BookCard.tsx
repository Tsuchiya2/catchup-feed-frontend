/**
 * BookCard Component (learning rotation, D-20) — console list row.
 *
 * One ingested book in the book manager: title, review status label, and
 * progress (review_cursor / total_chunks) as a squared violet bar
 * (復習 = バイオレット, README 原則5), with a single activate / deactivate
 * toggle.
 *
 * At most one book is active at a time; activating another book is an
 * implicit swap handled by the backend. Activating a finished book restarts
 * the read — no special confirmation, just the activate button (§8.2).
 */
'use client';

import * as React from 'react';
import { Play, Pause } from 'lucide-react';
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
 * BookCard — one hairline-divided row: title, progress, toggle.
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
    <div
      role="listitem"
      aria-label={`書籍: ${book.title}`}
      data-testid={LEARNING_TEST_IDS.BOOK}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
    >
      <div className="min-w-0 flex-1 basis-[240px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3
            className={cn(
              'text-[13.5px] leading-[1.7]',
              isActive ? 'text-console-ink' : 'text-console-ink-sub'
            )}
          >
            {book.title}
          </h3>
          <Badge variant={STATUS_VARIANT[status]}>{BOOK_STATUS_LABELS[status] ?? status}</Badge>
        </div>
        {/* Progress: 3px squared track, violet fill */}
        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-[3px] max-w-[240px] flex-1 bg-console-line-2"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${book.title} の進捗`}
          >
            <div className="h-full bg-console-violet" style={{ width: `${percent}%` }} />
          </div>
          <span className="shrink-0 font-mono text-[10.5px] text-console-ink-weak">
            {book.review_cursor} / {book.total_chunks} ({percent}%)
          </span>
        </div>
      </div>

      {/* Toggle */}
      {isActive ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeactivate(book)}
          disabled={disabled}
          data-testid={LEARNING_TEST_IDS.BOOK_TOGGLE}
          aria-label={`${book.title} を一時停止`}
        >
          <Pause className="mr-1 h-4 w-4" />
          一時停止
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onActivate(book)}
          disabled={disabled}
          data-testid={LEARNING_TEST_IDS.BOOK_TOGGLE}
          aria-label={`${book.title} を進行中にする`}
        >
          <Play className="mr-1 h-4 w-4" />
          {status === 'finished' ? '再読する' : '進行中にする'}
        </Button>
      )}
    </div>
  );
});
