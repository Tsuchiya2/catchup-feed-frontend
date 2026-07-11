'use client';

import * as React from 'react';
import { BookOpen, Info, Upload } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/books/BookCard';
import { UploadBookDialog } from '@/components/books/UploadBookDialog';
import { DeleteBookDialog } from '@/components/books/DeleteBookDialog';
import { useBooks } from '@/hooks/useBooks';
import type { PdfBook } from '@/types/api';

/**
 * Book PDF management page (D-25)
 *
 * Upload / list / delete for the book PDFs feeding the book RAG. The
 * ingest itself is asynchronous — the Mac's nightly batch (03:00) picks up
 * pending jobs, so a fresh upload sits at 「待機」 until the next morning
 * (Mac absent = carried over to the following night; degradation is fine).
 * CLI-ingested books appear read-only (`deletable: false`).
 */
export default function BooksPage() {
  const { books, isLoading, error, refetch } = useBooks();

  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [bookToDelete, setBookToDelete] = React.useState<PdfBook | null>(null);

  const pendingCount = books.filter((b) => b.status === 'pending').length;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Books"
          description={
            books.length > 0
              ? `${books.length} 冊${pendingCount > 0 ? `(取り込み待ち ${pendingCount} 冊)` : ''}`
              : '書籍 PDF のアップロードと取り込み管理'
          }
          className="mb-0"
        />
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          アップロード
        </Button>
      </div>

      {/* How ingest works — async nightly batch + idempotent replace */}
      <div className="mb-6 flex items-start gap-2 rounded-md border border-border/50 bg-muted/50 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          取り込みは Mac の夜間バッチ(03:00)で実行される非同期処理です。アップロード直後は
          「待機」のまま翌朝まで待ってください(Mac が不在の夜は翌晩に持ち越し)。
          同名ファイルを再アップロードすると置き換えて再取り込みされます(失敗時の再試行もこの方法で)。
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && books.length === 0 && (
        <EmptyState
          title="書籍はまだありません"
          description="PDF をアップロードすると、Mac の夜間バッチで取り込まれてラジオの書籍コーナーに使われます。"
          icon={<BookOpen className="h-12 w-12" />}
          action={
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              PDF をアップロード
            </Button>
          }
        />
      )}

      {/* Book list */}
      {!isLoading && !error && books.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2" role="list">
          {books.map((book) => (
            <BookCard key={book.file_path} book={book} onDelete={setBookToDelete} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <UploadBookDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <DeleteBookDialog
        book={bookToDelete}
        isOpen={bookToDelete !== null}
        onClose={() => setBookToDelete(null)}
      />
    </div>
  );
}
