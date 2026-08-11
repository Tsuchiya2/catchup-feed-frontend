'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/learning/BookCard';
import { useLearningBooks, useActivateBook, useDeactivateBook } from '@/hooks/useLearning';
import type { LearningBook } from '@/types/api';

/**
 * Learning — book management (D-20) — 放送卓(改訂版)
 *
 * Lists ingested books with progress, and lets the user pick the single
 * in-progress book. Activating a book swaps out whatever was active
 * (backend enforces at-most-one-active); pausing keeps the cursor;
 * re-activating a finished book restarts it. A plain list + toggle is all
 * this needs.
 */
export default function LearningBooksPage() {
  const { books, isLoading, error, refetch } = useLearningBooks();
  const { mutateAsync: activate, isPending: isActivating } = useActivateBook();
  const { mutateAsync: deactivate, isPending: isDeactivating } = useDeactivateBook();

  const busy = isActivating || isDeactivating;

  const handleActivate = React.useCallback(
    async (book: LearningBook) => {
      if (busy) {
        return;
      }
      try {
        await activate(book.id);
      } catch {
        // Error surfaced via the hook; the list re-syncs on the next fetch.
      }
    },
    [activate, busy]
  );

  const handleDeactivate = React.useCallback(
    async (book: LearningBook) => {
      if (busy) {
        return;
      }
      try {
        await deactivate(book.id);
      } catch {
        // Deactivate is idempotent; a retry is always safe.
      }
    },
    [deactivate, busy]
  );

  const activeBook = books.find((b) => b.review_status === 'active');

  return (
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      <PageHeader
        title="書籍の復習"
        description={
          isLoading
            ? '—'
            : activeBook
              ? `進行中: ${activeBook.title}`
              : '書籍の復習コーナーで進める1冊を選ぶ(同時に1冊)'
        }
        action={
          <Button asChild variant="ghost" size="sm" className="text-console-ink-weak">
            <Link href="/learning">
              <ArrowLeft className="mr-1 h-4 w-4" />
              復習へ戻る
            </Link>
          </Button>
        }
      />

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {isLoading && (
        <div className="border border-console-line-2 bg-console-panel" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
            >
              <span className="min-h-[42px] flex-1" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && books.length === 0 && (
        <EmptyState
          title="取り込み済みの書籍はありません"
          description="書籍の取り込み(ingest)は Mac 側の CLI で行います。取り込むとここに並びます。"
          icon={<BookOpen className="h-10 w-10" />}
        />
      )}

      {!isLoading && !error && books.length > 0 && (
        <div className="border border-console-line-2 bg-console-panel" role="list">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              disabled={busy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
