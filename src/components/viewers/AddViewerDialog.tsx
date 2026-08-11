'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ViewerForm } from './ViewerForm';
import { useCreateViewer } from '@/hooks/useViewers';
import type { ViewerFormData } from '@/utils/validation/viewerValidation';

interface AddViewerDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback when the viewer is successfully created */
  onSuccess?: () => void;
}

/**
 * AddViewerDialog - dialog for creating a read-only viewer account (D-27).
 *
 * The admin sets the initial password here and shares it with the friend
 * out-of-band (the app never emails credentials).
 */
export function AddViewerDialog({ isOpen, onClose, onSuccess }: AddViewerDialogProps) {
  const { mutateAsync, isPending, error, reset } = useCreateViewer();

  const handleSubmit = async (data: ViewerFormData) => {
    try {
      await mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      reset();
      onSuccess?.();
      onClose();
    } catch {
      // Error surfaces through the mutation error state in ViewerForm
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>視聴者を追加</DialogTitle>
          <DialogDescription>
            友人用の読み取り専用アカウントを作ります。このメールアドレスとパスワードでログインし、有効なソース一覧だけを閲覧できます。パスワードは自分で本人に渡してください。
          </DialogDescription>
        </DialogHeader>

        <ViewerForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={isPending}
          error={error}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
