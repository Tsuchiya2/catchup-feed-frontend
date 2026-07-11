/**
 * BookCard Component (book PDF management, D-25)
 *
 * One managed book in the /books list: title, filename, size, upload time,
 * ingest status badge, and chunk count. Pi uploads get a delete button;
 * CLI-ingested books (`deletable: false`) show a "CLI 取り込み" badge
 * instead — those stay managed by the pulse-books CLI on the Mac.
 *
 * Distinct from `components/learning/BookCard`, which drives the review
 * rotation; this card manages the PDF/ingest lifecycle.
 */
'use client';

import * as React from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { formatBytes } from '@/lib/utils/formatBytes';
import { BOOK_INGEST_STATUS_LABELS, BOOK_TEST_IDS } from '@/constants/book';
import type { PdfBook, BookIngestStatus } from '@/types/api';

interface BookCardProps {
  /** The book to display */
  book: PdfBook;
  /** Open the delete confirmation for this book (deletable entries only) */
  onDelete: (book: PdfBook) => void;
}

const STATUS_VARIANT: Record<BookIngestStatus, 'secondary' | 'default' | 'success' | 'destructive'> =
  {
    pending: 'secondary',
    processing: 'default',
    done: 'success',
    failed: 'destructive',
  };

/**
 * BookCard — title, file metadata, ingest status, and delete (when allowed).
 */
export const BookCard = React.memo(function BookCard({ book, onDelete }: BookCardProps) {
  const status = book.status;

  return (
    <Card data-testid={BOOK_TEST_IDS.CARD} role="listitem" aria-label={`書籍: ${book.title}`}>
      <CardContent className="flex flex-col gap-3 p-5">
        {/* Title + status */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-semibold leading-snug text-foreground">
              {book.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={book.filename}>
              {book.filename}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant={STATUS_VARIANT[status]} data-testid={BOOK_TEST_IDS.STATUS_BADGE}>
                {BOOK_INGEST_STATUS_LABELS[status] ?? status}
              </Badge>
              {!book.deletable && <Badge variant="outline">CLI 取り込み</Badge>}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="text-muted-foreground">サイズ</dt>
            <dd className="mt-0.5 font-medium text-foreground">{formatBytes(book.size_bytes)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">アップロード</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {book.uploaded_at ? formatRelativeTime(book.uploaded_at) : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">チャンク数</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {book.chunk_count !== null ? book.chunk_count : '-'}
            </dd>
          </div>
        </dl>

        {/* Status hint / actions */}
        <div className="flex items-end justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {status === 'pending' && '取り込みは Mac の夜間バッチで実行されます'}
            {status === 'failed' && '取り込みに失敗しました。再アップロードで再試行できます'}
          </p>
          {book.deletable ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(book)}
              data-testid={BOOK_TEST_IDS.DELETE_BUTTON}
              aria-label={`${book.title} を削除`}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              削除
            </Button>
          ) : (
            <p className="shrink-0 text-xs text-muted-foreground">CLI 側で管理</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
