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
          <DialogTitle>{subscriberName} の購読 URL</DialogTitle>
          <DialogDescription>
            この URL を {subscriberName}{' '}
            に渡してください。ポッドキャストアプリに貼り付けるとラジオを購読できます。
          </DialogDescription>
        </DialogHeader>

        {/* One-time warning */}
        <div
          role="alert"
          className="flex items-start gap-2 border border-destructive p-3 text-[13px] leading-[1.9] text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            この URL が表示されるのは<strong>今回の一度だけ</strong>
            です。閉じると二度と表示できません。今すぐコピーしてください。失くした場合は、このトークンを失効させて再発行してください。
          </p>
        </div>

        {/* Feed URL */}
        <div className="space-y-2">
          <p
            data-testid={SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_FEED_URL}
            className="select-all break-all border border-console-cyan bg-console-bg p-3 font-mono text-[12.5px] leading-[1.8] text-console-ink"
          >
            {issued.feed_url}
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={handleCopy}
            data-testid={SUBSCRIBER_TEST_IDS.COPY_FEED_URL_BUTTON}
            aria-label="購読 URL をコピー"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                コピーしました
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                URL をコピー
              </>
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            URL を保存した — 閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
