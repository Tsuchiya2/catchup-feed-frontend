'use client';

import * as React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useDeleteViewer } from '@/hooks/useViewers';
import { VIEWER_TEST_IDS } from '@/constants/viewer';
import type { Viewer } from '@/types/api';

interface DeleteViewerDialogProps {
  /** The viewer to delete (null = dialog hidden) */
  viewer: Viewer | null;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback after successful deletion */
  onSuccess?: () => void;
}

/**
 * DeleteViewerDialog - confirmation for the PHYSICAL delete.
 *
 * Unlike subscribers (soft delete), deleting a viewer permanently removes
 * the account (D-27 (4)). The wording makes the irreversibility explicit;
 * for a temporary block, deactivation is the right tool.
 */
export function DeleteViewerDialog({
  viewer,
  isOpen,
  onClose,
  onSuccess,
}: DeleteViewerDialogProps) {
  const { mutateAsync, isPending, error, reset } = useDeleteViewer();

  const handleConfirm = async () => {
    if (!viewer) {
      return;
    }
    try {
      await mutateAsync(viewer.id);
      reset();
      onSuccess?.();
      onClose();
    } catch {
      // Error shown via ErrorAlert
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!viewer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent data-testid={VIEWER_TEST_IDS.DELETE_DIALOG}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" aria-hidden="true" />
            {viewer.name} を削除しますか?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p className="font-medium text-destructive">
                {viewer.name} の視聴者アカウント({viewer.email}
                )を完全に削除します。ログインできなくなり、アカウントは復元できません。
              </p>
              <p className="text-xs text-console-ink-faint">
                一時的にアクセスを止めたいだけなら「無効化」を使ってください —
                いつでも元に戻せます。
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert error={error} />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            data-testid={VIEWER_TEST_IDS.DELETE_CONFIRM_BUTTON}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                削除中…
              </>
            ) : (
              '完全に削除する'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
