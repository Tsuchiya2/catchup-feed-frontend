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
import { useUpdateSubscriber } from '@/hooks/useSubscribers';
import type { Subscriber } from '@/types/api';
import type { SubscriberFormData } from '@/utils/validation/subscriberValidation';

interface EditSubscriberDialogProps {
  /** The subscriber being edited (null = dialog hidden) */
  subscriber: Subscriber | null;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback when the friend is successfully updated */
  onSuccess?: () => void;
}

/**
 * EditSubscriberDialog - dialog for editing a friend.
 *
 * PUT /subscribers/:id is a full replacement, so the form is seeded with
 * the current values and ALWAYS submits every field (name, email, note).
 */
export function EditSubscriberDialog({
  subscriber,
  isOpen,
  onClose,
  onSuccess,
}: EditSubscriberDialogProps) {
  const { mutateAsync, isPending, error, reset } = useUpdateSubscriber();

  const handleSubmit = async (data: SubscriberFormData) => {
    if (!subscriber) {
      return;
    }
    try {
      // Full replacement: send the complete new state
      await mutateAsync({
        id: subscriber.id,
        input: {
          name: data.name,
          email: data.email || null,
          note: data.note || null,
        },
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

  if (!subscriber) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Friend</DialogTitle>
          <DialogDescription>
            Update {subscriber.name}&apos;s details. All fields are saved as shown — clearing a
            field removes the stored value.
          </DialogDescription>
        </DialogHeader>

        <SubscriberForm
          key={subscriber.id}
          mode="edit"
          initialData={{
            name: subscriber.name,
            email: subscriber.email ?? '',
            note: subscriber.note ?? '',
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
