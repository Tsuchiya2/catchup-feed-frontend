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
          <DialogTitle>Add Viewer</DialogTitle>
          <DialogDescription>
            Create a read-only account for a friend. They can log in with this email and password to
            browse the active source list — nothing else. Share the password with them yourself.
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
