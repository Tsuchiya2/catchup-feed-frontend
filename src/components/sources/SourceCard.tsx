/**
 * SourceCard Component — one row of the console source list (放送卓改訂版).
 *
 * List form per design handoff: hairline-divided row inside a 1px-framed
 * panel. Shows kind label (mono), name + category/lang, feed URL (mono),
 * active toggle (admin) or status label (viewer), and edit/delete actions.
 *
 * Single-administrator system (C-7/C-20): the presence of the callbacks
 * decides whether management controls render (viewer = read-only, D-27).
 */
import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { safeExternalHref } from '@/lib/utils/safeExternalHref';
import type { Source, SourceKind } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { ActiveToggle } from './ActiveToggle';
import { SOURCE_TEST_IDS, SOURCE_ARIA_LABELS } from '@/constants/source';

/**
 * Mono label per source kind.
 * Sources from a pre-Phase 2 backend may omit `kind`; treat them as 'rss'.
 */
const KIND_LABELS: Record<SourceKind, string> = {
  rss: 'RSS',
  youtube: 'YT',
  podcast: 'POD',
  newsletter: 'NEWS',
};

/**
 * Props for the SourceCard component
 */
interface SourceCardProps {
  /** The source data to display */
  source: Source;
  /** Additional CSS classes */
  className?: string;
  /** Callback when active status is updated */
  onUpdateActive?: (sourceId: number, active: boolean) => Promise<void>;
  /** Callback when edit button is clicked */
  onEdit?: (source: Source) => void;
  /** Callback when delete button is clicked */
  onDelete?: (source: Source) => void;
}

/**
 * SourceCard displays a source as a console list row.
 * Memoized to prevent unnecessary re-renders in lists.
 */
export const SourceCard = React.memo(function SourceCard({
  source,
  className,
  onUpdateActive,
  onEdit,
  onDelete,
}: SourceCardProps) {
  const createdAt = source.created_at ? formatRelativeTimeJa(source.created_at) : '—';
  const kindLabel = KIND_LABELS[source.kind ?? 'rss'];

  // feed_url is externally sourced; only render a clickable link for safe
  // (http/https) schemes to neutralize javascript:/data: XSS (H-2).
  const safeFeedHref = safeExternalHref(source.feed_url);

  /**
   * Handle toggle callback
   * Wraps onUpdateActive to match ActiveToggle's expected signature
   */
  const handleToggle = React.useCallback(
    async (sourceId: number, active: boolean) => {
      if (onUpdateActive) {
        await onUpdateActive(sourceId, active);
      }
    },
    [onUpdateActive]
  );

  return (
    <div
      role="listitem"
      aria-label={`ソース: ${source.name}`}
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0',
        className
      )}
    >
      <span
        data-testid={SOURCE_TEST_IDS.KIND_BADGE}
        aria-label={`種別: ${kindLabel}`}
        className="w-[44px] shrink-0 font-mono text-[10.5px] tracking-[.12em] text-console-ink-faint"
      >
        {kindLabel}
      </span>

      <div className="min-w-0 flex-1 basis-[220px]">
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <h3
            className={cn(
              'truncate text-[13.5px]',
              source.active ? 'text-console-ink' : 'text-console-ink-faint'
            )}
          >
            {source.name}
          </h3>
          <span
            className="font-mono text-[10.5px] text-console-ink-faint"
            aria-label={`カテゴリ: ${source.category}`}
          >
            {source.category}
          </span>
          {source.lang && (
            <span
              className="font-mono text-[10.5px] text-console-ink-ghost"
              aria-label={`言語: ${source.lang}`}
            >
              {source.lang}
            </span>
          )}
        </div>
        {safeFeedHref ? (
          <a
            href={safeFeedHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-full truncate font-mono text-[10.5px] text-console-ink-weak hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
            title={source.feed_url}
            aria-label={`フィードを開く: ${source.feed_url}`}
          >
            {source.feed_url}
          </a>
        ) : (
          // Unsafe / unparseable scheme: show the raw value without a link.
          <span
            className="block max-w-full truncate font-mono text-[10.5px] text-console-ink-weak"
            title={source.feed_url}
          >
            {source.feed_url}
          </span>
        )}
      </div>

      <time
        className="hidden shrink-0 font-mono text-[10.5px] text-console-ink-ghost lg:block"
        dateTime={source.created_at || undefined}
        aria-label={`追加: ${createdAt}`}
      >
        {createdAt}
      </time>

      {/* Conditional rendering: Toggle when updatable, status label otherwise */}
      {onUpdateActive ? (
        <ActiveToggle
          sourceId={source.id}
          sourceName={source.name}
          initialActive={source.active}
          onToggle={handleToggle}
        />
      ) : (
        <StatusBadge active={source.active} />
      )}

      {(onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => onEdit(source)}
              data-testid={SOURCE_TEST_IDS.EDIT_BUTTON}
              aria-label={SOURCE_ARIA_LABELS.EDIT_BUTTON(source.name)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-console-ink-weak hover:text-destructive"
              onClick={() => onDelete(source)}
              data-testid={SOURCE_TEST_IDS.DELETE_BUTTON}
              aria-label={SOURCE_ARIA_LABELS.DELETE_BUTTON(source.name)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
});
