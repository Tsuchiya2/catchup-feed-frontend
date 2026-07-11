/**
 * DeleteBookDialog Component (D-25)
 *
 * Confirmation dialog for deleting an uploaded book. Deletion is immediate
 * and complete on the Pi: the books row (with its chunks and learning
 * items), the PDF file, and any pending ingest job all go — so the copy
 * spells that out before the destructive button.
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteBook } from '@/hooks/useBooks';
import { BOOK_TEST_IDS } from '@/constants/book';
import type { PdfBook } from '@/types/api';

interface DeleteBookDialogProps {
  /** Book to delete (null = dialog hidden) */
  book: PdfBook | null;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback when the book is successfully deleted */
  onSuccess?: () => void;
}

export function DeleteBookDialog({ book, isOpen, onClose, onSuccess }: DeleteBookDialogProps) {
  const { mutateAsync, isPending, error, reset } = useDeleteBook();

  const handleDelete = async () => {
    if (!book) {
      return;
    }
    try {
      await mutateAsync(book.filename);
      reset();
      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by the mutation's error state and shown below.
    }
  };

  const handleClose = () => {
    if (isPending) {
      return; // Don't let Escape / overlay click swallow an in-flight delete.
    }
    reset();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent data-testid={BOOK_TEST_IDS.DELETE_DIALOG}>
        <DialogHeader>
          <DialogTitle>書籍を削除</DialogTitle>
          <DialogDescription>
            「{book?.title}」を削除しますか? PDF
            ファイルと取り込み済みデータ(チャンク・学習項目)がすべて削除されます。この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error.message || '削除に失敗しました。もう一度お試しください。'}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            data-testid={BOOK_TEST_IDS.DELETE_CANCEL_BUTTON}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !book}
            data-testid={BOOK_TEST_IDS.DELETE_CONFIRM_BUTTON}
            aria-label={book ? `${book.title} を削除する` : '削除する'}
          >
            {isPending ? '削除中…' : '削除する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
