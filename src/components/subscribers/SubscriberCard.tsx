/**
 * SubscriberCard Component
 *
 * Displays a friend (subscriber) in a card format:
 * - Name + active/deactivated badge (deactivation = soft delete)
 * - Email / note (when present)
 * - Added date
 * - Manage link (detail page: tokens + access), Edit and Deactivate actions
 */
import * as React from 'react';
import Link from 'next/link';
import { UserRound, Pencil, UserRoundX, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { Subscriber } from '@/types/api';

interface SubscriberCardProps {
  /** The subscriber to display */
  subscriber: Subscriber;
  /** Additional CSS classes */
  className?: string;
  /** Callback when edit is clicked */
  onEdit?: (subscriber: Subscriber) => void;
  /** Callback when deactivate is clicked (active subscribers only) */
  onDeactivate?: (subscriber: Subscriber) => void;
}

/**
 * SubscriberCard displays a friend in a card format.
 */
export const SubscriberCard = React.memo(function SubscriberCard({
  subscriber,
  className,
  onEdit,
  onDeactivate,
}: SubscriberCardProps) {
  return (
    <Card
      className={cn('flex flex-col', !subscriber.active && 'opacity-70', className)}
      role="listitem"
      aria-label={`Friend: ${subscriber.name}`}
      data-testid={SUBSCRIBER_TEST_IDS.CARD}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Icon, name, status */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-foreground">{subscriber.name}</h3>
              {subscriber.active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">
                  Deactivated
                  {subscriber.deactivated_at
                    ? ` ${formatRelativeTime(subscriber.deactivated_at)}`
                    : ''}
                </Badge>
              )}
            </div>
            {subscriber.email && (
              <p className="mt-1 truncate text-xs text-muted-foreground" title={subscriber.email}>
                {subscriber.email}
              </p>
            )}
          </div>
        </div>

        {/* Note */}
        {subscriber.note && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{subscriber.note}</p>
        )}

        {/* Footer: added date + actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <time
            className="text-xs text-muted-foreground"
            dateTime={subscriber.created_at || undefined}
          >
            Added {formatRelativeTime(subscriber.created_at)}
          </time>
          <div className="flex items-center gap-1">
            <Button asChild variant="outline" size="sm">
              <Link href={`/subscribers/${subscriber.id}`} aria-label={`Manage ${subscriber.name}`}>
                <KeyRound className="mr-1 h-4 w-4" />
                Manage
              </Link>
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(subscriber)}
                data-testid={SUBSCRIBER_TEST_IDS.EDIT_BUTTON}
                aria-label={`Edit friend: ${subscriber.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDeactivate && subscriber.active && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDeactivate(subscriber)}
                data-testid={SUBSCRIBER_TEST_IDS.DEACTIVATE_BUTTON}
                aria-label={`Deactivate friend: ${subscriber.name}`}
              >
                <UserRoundX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
