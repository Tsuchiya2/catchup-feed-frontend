'use client';

import * as React from 'react';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { IssuedFeedToken } from '@/types/api';

interface IssuedTokenDialogProps {
  /** The freshly issued token (null = dialog hidden) */
  issued: IssuedFeedToken | null;
  /** Name of the friend the token belongs to */
  subscriberName: string;
  /** Callback when the dialog is dismissed (the URL is gone after this) */
  onClose: () => void;
}

/**
 * IssuedTokenDialog - ONE-TIME display of a freshly issued feed URL.
 *
 * D-5: tokens are stored hashed on the backend, so the plaintext token and
 * the subscription URL shown here can NEVER be retrieved again. The dialog
 * shows the URL prominently with a copy button and an explicit warning
 * that closing the dialog loses the URL forever (revoke + re-issue is the
 * only recovery).
 */
export function IssuedTokenDialog({ issued, subscriberName, onClose }: IssuedTokenDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!issued) {
      return;
    }
    try {
      await navigator.clipboard.writeText(issued.feed_url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail on insecure contexts; the URL stays selectable
      setCopied(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCopied(false);
      onClose();
    }
  };

  if (!issued) {
    return null;
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        data-testid={SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_DIALOG}
        // The URL is shown only once (D-5): block Escape / overlay-click
        // dismissal so an accidental key press or tap cannot lose it.
        // Closing requires an explicit button.
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Subscription URL for {subscriberName}</DialogTitle>
          <DialogDescription>
            Share this URL with {subscriberName} — pasting it into a podcast app subscribes to the
            radio feed.
          </DialogDescription>
        </DialogHeader>

        {/* One-time warning */}
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            This URL is shown <strong>only once</strong> and cannot be displayed again after you
            close this dialog. Copy it now. If it is lost, revoke the token and issue a new one.
          </p>
        </div>

        {/* Feed URL */}
        <div className="space-y-2">
          <p
            data-testid={SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_FEED_URL}
            className="select-all break-all rounded-md border border-primary/30 bg-primary/5 p-3 font-mono text-sm text-foreground"
          >
            {issued.feed_url}
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={handleCopy}
            data-testid={SUBSCRIBER_TEST_IDS.COPY_FEED_URL_BUTTON}
            aria-label="Copy subscription URL"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </>
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            I saved the URL — close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
