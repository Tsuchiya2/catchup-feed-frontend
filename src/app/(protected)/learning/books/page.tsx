'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/learning/BookCard';
import { useLearningBooks, useActivateBook, useDeactivateBook } from '@/hooks/useLearning';
import type { LearningBook } from '@/types/api';

/**
 * Learning — book management (D-20)
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
    <div className="container py-8">
      <div className="mb-2">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/learning">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Review
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Books"
        description={
          activeBook
            ? `進行中: ${activeBook.title}`
            : '書籍の復習コーナーで進める1冊を選ぶ(同時に1冊)'
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && !error && books.length === 0 && (
        <EmptyState
          title="取り込み済みの書籍はありません"
          description="書籍の取り込み(ingest)は Mac 側の CLI で行います。取り込むとここに並びます。"
          icon={<BookOpen className="h-12 w-12" />}
        />
      )}

      {!isLoading && !error && books.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2" role="list">
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
