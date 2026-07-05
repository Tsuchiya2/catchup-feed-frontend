'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubscriberForm } from './SubscriberForm';
import { useCreateSubscriber } from '@/hooks/useSubscribers';
import type { SubscriberFormData } from '@/utils/validation/subscriberValidation';

interface AddSubscriberDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback when the friend is successfully created */
  onSuccess?: () => void;
}

/**
 * AddSubscriberDialog - dialog for registering a new friend.
 */
export function AddSubscriberDialog({ isOpen, onClose, onSuccess }: AddSubscriberDialogProps) {
  const { mutateAsync, isPending, error, reset } = useCreateSubscriber();

  const handleSubmit = async (data: SubscriberFormData) => {
    try {
      await mutateAsync({
        name: data.name,
        email: data.email || null,
        note: data.note || null,
      });
      reset();
      onSuccess?.();
      onClose();
    } catch {
      // Error surfaces through the mutation error state in SubscriberForm
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
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Register a friend who will subscribe to the radio feed. You can issue their
            subscription token afterwards from the Manage screen.
          </DialogDescription>
        </DialogHeader>

        <SubscriberForm
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
