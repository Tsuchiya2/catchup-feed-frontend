/**
 * BookCard Component (book PDF management, D-25) — console list row.
 *
 * One managed book in the /books list: title, filename (mono), size,
 * upload time, ingest status label, and chunk count. Pi uploads get a
 * delete button; CLI-ingested books (`deletable: false`) show a
 * 「CLI 取り込み」 label instead — those stay managed by the pulse-books
 * CLI on the Mac.
 *
 * Distinct from `components/learning/BookCard`, which drives the review
 * rotation; this card manages the PDF/ingest lifecycle.
 */
'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { formatBytes } from '@/lib/utils/formatBytes';
import { BOOK_INGEST_STATUS_LABELS, BOOK_TEST_IDS } from '@/constants/book';
import type { PdfBook, BookIngestStatus } from '@/types/api';

interface BookCardProps {
  /** The book to display */
  book: PdfBook;
  /** Open the delete confirmation for this book (deletable entries only) */
  onDelete: (book: PdfBook) => void;
}

const STATUS_VARIANT: Record<BookIngestStatus, 'secondary' | 'default' | 'success' | 'warn'> = {
  pending: 'secondary',
  processing: 'default',
  done: 'success',
  // Degradation, not destruction: warm warning tone, red stays for
  // destructive confirmation only (README エラー／縮退).
  failed: 'warn',
};

/**
 * BookCard — one hairline-divided row: title, metadata, status, delete.
 */
export const BookCard = React.memo(function BookCard({ book, onDelete }: BookCardProps) {
  const status = book.status;

  return (
    <div
      role="listitem"
      aria-label={`書籍: ${book.title}`}
      data-testid={BOOK_TEST_IDS.CARD}
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
    >
      <div className="min-w-0 flex-1 basis-[240px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="break-words text-[13.5px] text-console-ink">{book.title}</h3>
          <Badge variant={STATUS_VARIANT[status]} data-testid={BOOK_TEST_IDS.STATUS_BADGE}>
            {BOOK_INGEST_STATUS_LABELS[status] ?? status}
          </Badge>
          {!book.deletable && <Badge variant="outline">CLI 取り込み</Badge>}
        </div>
        <p
          className="mt-0.5 truncate font-mono text-[10.5px] text-console-ink-weak"
          title={book.filename}
        >
          {book.filename} ／ {formatBytes(book.size_bytes)} ／{' '}
          {book.chunk_count !== null ? `${book.chunk_count} チャンク` : 'チャンク —'}
        </p>
        {(status === 'pending' || status === 'failed') && (
          <p className="mt-0.5 text-[11.5px] text-console-ink-faint">
            {status === 'pending'
              ? '取り込みは Mac の夜間バッチで実行されます'
              : '取り込みに失敗しました。再アップロードで再試行できます'}
          </p>
        )}
      </div>

      <time
        className="hidden shrink-0 font-mono text-[10.5px] text-console-ink-ghost lg:block"
        dateTime={book.uploaded_at || undefined}
      >
        {book.uploaded_at ? formatRelativeTimeJa(book.uploaded_at) : '—'}
      </time>

      {book.deletable ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-console-ink-weak hover:text-destructive"
          onClick={() => onDelete(book)}
          data-testid={BOOK_TEST_IDS.DELETE_BUTTON}
          aria-label={`${book.title} を削除`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <span className="shrink-0 font-mono text-[10.5px] text-console-ink-ghost">CLI 管理</span>
      )}
    </div>
  );
});
