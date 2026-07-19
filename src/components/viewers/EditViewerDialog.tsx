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
import { useUpdateViewer } from '@/hooks/useViewers';
import type { Viewer } from '@/types/api';
import type { ViewerFormData } from '@/utils/validation/viewerValidation';

interface EditViewerDialogProps {
  /** The viewer being edited (null = dialog hidden) */
  viewer: Viewer | null;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback when the viewer is successfully updated */
  onSuccess?: () => void;
}

/**
 * EditViewerDialog - dialog for editing a viewer account (D-27).
 *
 * Name and email are always sent; the password is only included in the PUT
 * body when the field is non-empty (blank = keep the current password).
 */
export function EditViewerDialog({ viewer, isOpen, onClose, onSuccess }: EditViewerDialogProps) {
  const { mutateAsync, isPending, error, reset } = useUpdateViewer();

  const handleSubmit = async (data: ViewerFormData) => {
    if (!viewer) {
      return;
    }
    try {
      await mutateAsync({
        id: viewer.id,
        input: {
          name: data.name,
          email: data.email,
          // Only reset the password when one was typed; omitting the key
          // keeps the current password (backend contract).
          ...(data.password ? { password: data.password } : {}),
        },
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

  if (!viewer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Viewer</DialogTitle>
          <DialogDescription>
            Update {viewer.name}&apos;s account. Leave the password blank to keep their current
            password.
          </DialogDescription>
        </DialogHeader>

        <ViewerForm
          key={viewer.id}
          mode="edit"
          initialData={{
            name: viewer.name,
            email: viewer.email,
            password: '',
          }}
          onSubmit={handleSubmit}
          isLoading={isPending}
          error={error}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
