'use client';

import * as React from 'react';
import { Loader2, UserRoundX } from 'lucide-react';
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
import { useDeactivateSubscriber } from '@/hooks/useSubscribers';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { Subscriber } from '@/types/api';

interface DeactivateSubscriberDialogProps {
  /** The subscriber to deactivate (null = dialog hidden) */
  subscriber: Subscriber | null;
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog should close */
  onClose: () => void;
  /** Optional callback after successful deactivation */
  onSuccess?: () => void;
}

/**
 * DeactivateSubscriberDialog - confirmation for the soft delete.
 *
 * "Delete" on subscribers is a DEACTIVATION: the record and access history
 * are kept, delivery stops. The dialog wording makes that explicit so it
 * is not mistaken for a destructive removal.
 */
export function DeactivateSubscriberDialog({
  subscriber,
  isOpen,
  onClose,
  onSuccess,
}: DeactivateSubscriberDialogProps) {
  const { mutateAsync, isPending, error, reset } = useDeactivateSubscriber();

  const handleConfirm = async () => {
    if (!subscriber) {
      return;
    }
    try {
      await mutateAsync(subscriber.id);
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

  if (!subscriber) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent data-testid={SUBSCRIBER_TEST_IDS.DEACTIVATE_DIALOG}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundX className="h-5 w-5 text-destructive" aria-hidden="true" />
            Deactivate {subscriber.name}?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>
                This deactivates the friend instead of deleting them: their record and access
                history are kept, but their feed tokens stop working and no new episodes will be
                delivered.
              </p>
              <p className="text-xs text-muted-foreground">
                Deactivation is a soft delete — nothing is permanently removed.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert error={error} />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            data-testid={SUBSCRIBER_TEST_IDS.DEACTIVATE_CONFIRM_BUTTON}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              'Deactivate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
