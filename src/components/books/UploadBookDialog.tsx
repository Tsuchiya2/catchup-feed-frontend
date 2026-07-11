/**
 * UploadBookDialog Component (D-25)
 *
 * Dialog for uploading a book PDF: file picker (accept=.pdf) + optional
 * title. The 100MB limit is checked client-side before anything leaves the
 * browser; the backend still answers 413 as the source of truth.
 *
 * The dialog stays open with a progress indicator while the upload runs
 * (a 100MB PDF over the tunnel can take a while) and blocks closing so the
 * request isn't abandoned by accident. On success the caller's list is
 * refetched by the mutation and the dialog closes.
 */
'use client';

import * as React from 'react';
import { Loader2, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadBook } from '@/hooks/useBooks';
import { ApiError } from '@/lib/api/errors';
import { formatBytes } from '@/lib/utils/formatBytes';
import { BOOK_MAX_UPLOAD_BYTES, BOOK_TEST_IDS } from '@/constants/book';

interface UploadBookDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback when the upload succeeds */
  onSuccess?: () => void;
}

/**
 * Map an upload failure to a user-facing Japanese message.
 */
function uploadErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    if (error.status === 413) {
      return 'ファイルサイズが上限(100MB)を超えています。';
    }
    if (error.status === 400) {
      return `PDF として受理されませんでした(${error.message})。ファイルを確認してください。`;
    }
  }
  return error.message || 'アップロードに失敗しました。もう一度お試しください。';
}

export function UploadBookDialog({ isOpen, onClose, onSuccess }: UploadBookDialogProps) {
  const { mutateAsync, isPending, error, reset } = useUploadBook();

  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState('');
  const [clientError, setClientError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = React.useCallback(() => {
    setFile(null);
    setTitle('');
    setClientError(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    reset();
    if (selected && selected.size > BOOK_MAX_UPLOAD_BYTES) {
      setClientError(
        `ファイルサイズが上限(100MB)を超えています(選択中: ${formatBytes(selected.size)})。`
      );
    } else {
      setClientError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || isPending) {
      return;
    }
    if (file.size > BOOK_MAX_UPLOAD_BYTES) {
      setClientError(
        `ファイルサイズが上限(100MB)を超えています(選択中: ${formatBytes(file.size)})。`
      );
      return;
    }
    try {
      await mutateAsync({ file, title: title.trim() || undefined });
      resetForm();
      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by the mutation's error state and shown below.
    }
  };

  const handleClose = () => {
    if (isPending) {
      return; // Don't abandon an in-flight upload by accident.
    }
    resetForm();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const errorMessage = clientError ?? (error ? uploadErrorMessage(error) : null);
  const canSubmit = file !== null && clientError === null && !isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent data-testid={BOOK_TEST_IDS.UPLOAD_DIALOG}>
        <DialogHeader>
          <DialogTitle>書籍 PDF をアップロード</DialogTitle>
          <DialogDescription>
            取り込みは Mac の夜間バッチ(03:00)で実行されます。アップロード直後は「待機」のまま翌朝を待ってください。同名ファイルの再アップロードは置き換え(再取り込み)になります。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-file">PDF ファイル(最大 100MB)</Label>
            <Input
              id="book-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isPending}
              data-testid={BOOK_TEST_IDS.UPLOAD_FILE_INPUT}
              aria-describedby={errorMessage ? 'book-upload-error' : undefined}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name}({formatBytes(file.size)})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-title">タイトル(任意)</Label>
            <Input
              id="book-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="省略時はファイル名から設定"
              disabled={isPending}
              data-testid={BOOK_TEST_IDS.UPLOAD_TITLE_INPUT}
            />
          </div>

          {errorMessage && (
            <div
              id="book-upload-error"
              role="alert"
              data-testid={BOOK_TEST_IDS.UPLOAD_ERROR}
              className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          )}

          {isPending && (
            <div
              className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground"
              role="status"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              アップロード中… ファイルサイズによっては数分かかります。この画面を閉じないでください。
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              data-testid={BOOK_TEST_IDS.UPLOAD_SUBMIT_BUTTON}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isPending ? 'アップロード中…' : 'アップロード'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
