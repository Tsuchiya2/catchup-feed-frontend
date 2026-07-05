'use client';

import * as React from 'react';
import { Loader2, ShieldOff } from 'lucide-react';
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
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { FeedToken } from '@/types/api';

interface RevokeTokenDialogProps {
  /** The token to revoke (null = dialog hidden) */
  token: FeedToken | null;
  /** Name of the friend the token belongs to */
  subscriberName: string;
  /** Whether the revocation request is in flight */
  isPending: boolean;
  /** Mutation error, if any */
  error: Error | null;
  /** Called when the user confirms the revocation */
  onConfirm: (tokenId: number) => Promise<void>;
  /** Callback when the dialog should close */
  onClose: () => void;
}

/**
 * RevokeTokenDialog - confirmation for token revocation.
 *
 * Revocation is IRREVERSIBLE: a revoked token can never be re-activated.
 * The friend's podcast app stops receiving updates until a new token is
 * issued and they re-subscribe with the new URL.
 */
export function RevokeTokenDialog({
  token,
  subscriberName,
  isPending,
  error,
  onConfirm,
  onClose,
}: RevokeTokenDialogProps) {
  if (!token) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid={SUBSCRIBER_TEST_IDS.REVOKE_DIALOG}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-destructive" aria-hidden="true" />
            Revoke this token?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>
                Token issued {formatRelativeTime(token.created_at)} for {subscriberName}.
              </p>
              <p className="font-medium text-destructive">
                Revocation cannot be undone. {subscriberName}&apos;s podcast app will stop updating
                until you issue a new token and share the new URL.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert error={error} />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(token.id)}
            disabled={isPending}
            data-testid={SUBSCRIBER_TEST_IDS.REVOKE_CONFIRM_BUTTON}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke permanently'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
