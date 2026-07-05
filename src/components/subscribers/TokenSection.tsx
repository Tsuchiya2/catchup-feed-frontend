'use client';

import * as React from 'react';
import { KeyRound, Plus, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { useSubscriberTokens, useIssueToken, useRevokeToken } from '@/hooks/useSubscribers';
import { IssuedTokenDialog } from './IssuedTokenDialog';
import { RevokeTokenDialog } from './RevokeTokenDialog';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { FeedToken, IssuedFeedToken, Subscriber } from '@/types/api';

interface TokenSectionProps {
  /** The friend whose tokens are managed */
  subscriber: Subscriber;
}

/**
 * TokenSection - feed token management for one friend.
 *
 * - Lists tokens (issue date + status only; plaintext never appears — D-5)
 * - Issues a new token and shows the one-time subscription URL
 * - Revokes tokens with an explicit "irreversible" confirmation
 */
export function TokenSection({ subscriber }: TokenSectionProps) {
  const { tokens, isLoading, error } = useSubscriberTokens(subscriber.id);
  const issueMutation = useIssueToken(subscriber.id);
  const revokeMutation = useRevokeToken(subscriber.id);

  const [issued, setIssued] = React.useState<IssuedFeedToken | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = React.useState<FeedToken | null>(null);

  const handleIssue = async () => {
    try {
      const result = await issueMutation.mutateAsync();
      // One-time display (D-5): keep the plaintext only in local state
      setIssued(result);
    } catch {
      // Error surfaces via issueMutation.error below
    }
  };

  const handleRevoke = async (tokenId: number) => {
    try {
      await revokeMutation.mutateAsync(tokenId);
      revokeMutation.reset();
      setTokenToRevoke(null);
    } catch {
      // Error surfaces via revokeMutation.error in the dialog
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
          Feed Tokens
        </CardTitle>
        <Button
          size="sm"
          onClick={handleIssue}
          disabled={issueMutation.isPending || !subscriber.active}
          data-testid={SUBSCRIBER_TEST_IDS.ISSUE_TOKEN_BUTTON}
        >
          <Plus className="mr-1 h-4 w-4" />
          {issueMutation.isPending ? 'Issuing...' : 'Issue Token'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Notes on token semantics */}
        <p className="text-xs text-muted-foreground">
          The subscription URL is shown only once at issue time and can never be displayed again
          (tokens are stored hashed). If a URL is lost, revoke the token and issue a new one.
        </p>

        {!subscriber.active && (
          <p className="text-xs text-muted-foreground">
            This friend is deactivated; new tokens cannot be issued.
          </p>
        )}

        <ErrorAlert error={error || issueMutation.error} />

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && tokens.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No tokens yet. Issue one to let {subscriber.name} subscribe.
          </p>
        )}

        {/* Token list */}
        {!isLoading && tokens.length > 0 && (
          <ul className="divide-y divide-border/50" aria-label="Feed tokens">
            {tokens.map((token) => (
              <li key={token.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Token #{token.id}</span>
                    {token.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Issued {formatRelativeTime(token.created_at)}
                    {token.revoked_at && <> · Revoked {formatRelativeTime(token.revoked_at)}</>}
                  </p>
                </div>
                {token.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setTokenToRevoke(token)}
                    data-testid={SUBSCRIBER_TEST_IDS.REVOKE_TOKEN_BUTTON}
                    aria-label={`Revoke token #${token.id}`}
                  >
                    <ShieldOff className="mr-1 h-4 w-4" />
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {/* One-time URL display (D-5) */}
      <IssuedTokenDialog
        issued={issued}
        subscriberName={subscriber.name}
        onClose={() => {
          setIssued(null);
          // D-5: drop the plaintext token from the mutation cache too, so it
          // cannot be re-read via devtools after the one-time dialog closes
          issueMutation.reset();
        }}
      />

      {/* Irreversible revocation confirmation */}
      <RevokeTokenDialog
        token={tokenToRevoke}
        subscriberName={subscriber.name}
        isPending={revokeMutation.isPending}
        error={revokeMutation.error}
        onConfirm={handleRevoke}
        onClose={() => {
          revokeMutation.reset();
          setTokenToRevoke(null);
        }}
      />
    </Card>
  );
}
