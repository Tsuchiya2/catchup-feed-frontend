'use client';

import * as React from 'react';
import { KeyRound, Plus, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
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
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          フィードトークン
        </CardTitle>
        <Button
          size="sm"
          onClick={handleIssue}
          disabled={issueMutation.isPending || !subscriber.active}
          data-testid={SUBSCRIBER_TEST_IDS.ISSUE_TOKEN_BUTTON}
        >
          <Plus className="mr-1 h-4 w-4" />
          {issueMutation.isPending ? '発行中…' : 'トークンを発行'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Notes on token semantics */}
        <p className="text-[12px] leading-[1.9] text-console-ink-weak">
          購読 URL
          が表示されるのは発行時の一度だけです(トークンはハッシュ化して保存されるため、再表示はできません)。URL
          を失くした場合は、失効させて再発行してください。
        </p>

        {!subscriber.active && (
          <p className="text-[12px] text-console-ink-weak">
            この友人は無効化されているため、新しいトークンは発行できません。
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
          <p className="py-4 text-center text-[12.5px] text-console-ink-weak">
            トークンはまだありません。発行すると {subscriber.name} が購読できるようになります。
          </p>
        )}

        {/* Token list */}
        {!isLoading && tokens.length > 0 && (
          <ul className="divide-y divide-console-line-1" aria-label="フィードトークン">
            {tokens.map((token) => (
              <li key={token.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[12.5px] text-console-ink">
                      TOKEN #{token.id}
                    </span>
                    {token.active ? (
                      <Badge variant="success">有効</Badge>
                    ) : (
                      <Badge variant="secondary">失効済</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[10.5px] text-console-ink-faint">
                    発行 {formatRelativeTimeJa(token.created_at)}
                    {token.revoked_at && <> ／ 失効 {formatRelativeTimeJa(token.revoked_at)}</>}
                  </p>
                </div>
                {token.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTokenToRevoke(token)}
                    data-testid={SUBSCRIBER_TEST_IDS.REVOKE_TOKEN_BUTTON}
                    aria-label={`トークン #${token.id} を失効`}
                  >
                    <ShieldOff className="mr-1 h-4 w-4" />
                    失効
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
