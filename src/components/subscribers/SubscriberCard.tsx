/**
 * SubscriberCard Component — one row of the console friend list (放送卓改訂版).
 *
 * List form per design handoff: hairline-divided row inside a 1px-framed
 * panel. Shows name + email/note, status label (deactivation = soft delete),
 * added date (mono), and 管理 / 編集 / 無効化 actions.
 */
import * as React from 'react';
import Link from 'next/link';
import { Pencil, UserRoundX, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
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
 * SubscriberCard displays a friend as a console list row.
 */
export const SubscriberCard = React.memo(function SubscriberCard({
  subscriber,
  className,
  onEdit,
  onDeactivate,
}: SubscriberCardProps) {
  return (
    <div
      role="listitem"
      aria-label={`友人: ${subscriber.name}`}
      data-testid={SUBSCRIBER_TEST_IDS.CARD}
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0',
        className
      )}
    >
      <div className="min-w-0 flex-1 basis-[220px]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3
            className={cn(
              'truncate text-[13.5px]',
              subscriber.active ? 'text-console-ink' : 'text-console-ink-faint'
            )}
          >
            {subscriber.name}
          </h3>
          {subscriber.active ? (
            <Badge variant="success">有効</Badge>
          ) : (
            <Badge variant="secondary">
              無効化済
              {subscriber.deactivated_at
                ? ` ${formatRelativeTimeJa(subscriber.deactivated_at)}`
                : ''}
            </Badge>
          )}
        </div>
        {(subscriber.email || subscriber.note) && (
          <p
            className="mt-0.5 truncate font-mono text-[10.5px] text-console-ink-weak"
            title={subscriber.email || subscriber.note || undefined}
          >
            {subscriber.email}
            {subscriber.email && subscriber.note && ' ／ '}
            {subscriber.note}
          </p>
        )}
      </div>

      <time
        className="hidden shrink-0 font-mono text-[10.5px] text-console-ink-ghost lg:block"
        dateTime={subscriber.created_at || undefined}
      >
        {formatRelativeTimeJa(subscriber.created_at)}
      </time>

      <div className="flex shrink-0 items-center gap-1">
        <Button asChild variant="outline" size="sm">
          <Link href={`/subscribers/${subscriber.id}`} aria-label={`${subscriber.name} を管理`}>
            <KeyRound className="mr-1 h-4 w-4" />
            管理
          </Link>
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onEdit(subscriber)}
            data-testid={SUBSCRIBER_TEST_IDS.EDIT_BUTTON}
            aria-label={`友人を編集: ${subscriber.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {onDeactivate && subscriber.active && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-console-ink-weak hover:text-destructive"
            onClick={() => onDeactivate(subscriber)}
            data-testid={SUBSCRIBER_TEST_IDS.DEACTIVATE_BUTTON}
            aria-label={`友人を無効化: ${subscriber.name}`}
          >
            <UserRoundX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
