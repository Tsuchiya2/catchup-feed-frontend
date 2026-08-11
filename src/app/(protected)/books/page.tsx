'use client';

import * as React from 'react';
import { BookOpen, Upload } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/books/BookCard';
import { UploadBookDialog } from '@/components/books/UploadBookDialog';
import { DeleteBookDialog } from '@/components/books/DeleteBookDialog';
import { useBooks } from '@/hooks/useBooks';
import type { PdfBook } from '@/types/api';

/**
 * Book PDF management page (D-25) — 放送卓(改訂版)
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
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      <PageHeader
        title="書籍"
        description={
          isLoading
            ? '— 冊'
            : books.length > 0
              ? `${books.length} 冊${pendingCount > 0 ? ` ／ 取り込み待ち ${pendingCount} 冊` : ''}`
              : '書籍 PDF のアップロードと取り込み管理'
        }
        action={
          <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-1 h-4 w-4" />
            アップロード
          </Button>
        }
      />

      {/* How ingest works — async nightly batch + idempotent replace */}
      <div className="border border-console-line-2 bg-console-panel px-[18px] py-3">
        <p className="text-[12px] leading-[1.9] text-console-ink-weak [text-wrap:pretty]">
          取り込みは Mac の夜間バッチ(03:00)で実行される非同期処理です。アップロード直後は
          「待機」のまま翌朝まで待ってください(Mac が不在の夜は翌晩に持ち越し)。
          同名ファイルを再アップロードすると置き換えて再取り込みされます(失敗時の再試行もこの方法で)。
        </p>
      </div>

      {/* Error State */}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Loading State */}
      {isLoading && (
        <div className="border border-console-line-2 bg-console-panel" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
            >
              <span className="min-h-[34px] flex-1" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && books.length === 0 && (
        <EmptyState
          title="書籍はまだありません"
          description="PDF をアップロードすると、Mac の夜間バッチで取り込まれてラジオの書籍コーナーに使われます。"
          icon={<BookOpen className="h-10 w-10" />}
          action={
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-1 h-4 w-4" />
              PDF をアップロード
            </Button>
          }
        />
      )}

      {/* Book list */}
      {!isLoading && !error && books.length > 0 && (
        <div className="border border-console-line-2 bg-console-panel" role="list">
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
