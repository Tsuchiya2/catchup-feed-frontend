/**
 * ViewerCard Component — one row of the console viewer list (放送卓改訂版).
 *
 * Displays a read-only viewer account (D-27): name + status label,
 * login email (mono), added date, and edit / activate-toggle / delete
 * (PHYSICAL, confirmed downstream) actions.
 */
import * as React from 'react';
import { Pencil, Trash2, UserRoundCheck, UserRoundX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { VIEWER_TEST_IDS } from '@/constants/viewer';
import type { Viewer } from '@/types/api';

interface ViewerCardProps {
  /** The viewer to display */
  viewer: Viewer;
  /** Additional CSS classes */
  className?: string;
  /** Callback when edit is clicked */
  onEdit?: (viewer: Viewer) => void;
  /** Callback when the activate/deactivate toggle is clicked */
  onToggleActive?: (viewer: Viewer) => void;
  /** Callback when delete is clicked (physical delete — confirm downstream) */
  onDelete?: (viewer: Viewer) => void;
  /** Disables the toggle while a toggle mutation is in flight */
  isToggling?: boolean;
}

/**
 * ViewerCard displays a viewer account as a console list row.
 */
export const ViewerCard = React.memo(function ViewerCard({
  viewer,
  className,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling = false,
}: ViewerCardProps) {
  return (
    <div
      role="listitem"
      aria-label={`視聴者: ${viewer.name}`}
      data-testid={VIEWER_TEST_IDS.CARD}
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
              viewer.active ? 'text-console-ink' : 'text-console-ink-faint'
            )}
          >
            {viewer.name}
          </h3>
          {viewer.active ? (
            <Badge variant="success">有効</Badge>
          ) : (
            <Badge variant="secondary">
              無効化済
              {viewer.deactivated_at ? ` ${formatRelativeTimeJa(viewer.deactivated_at)}` : ''}
            </Badge>
          )}
        </div>
        <p
          className="mt-0.5 truncate font-mono text-[10.5px] text-console-ink-weak"
          title={viewer.email}
        >
          {viewer.email}
        </p>
      </div>

      <time
        className="hidden shrink-0 font-mono text-[10.5px] text-console-ink-ghost lg:block"
        dateTime={viewer.created_at || undefined}
      >
        {formatRelativeTimeJa(viewer.created_at)}
      </time>

      <div className="flex shrink-0 items-center gap-1">
        {onToggleActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(viewer)}
            disabled={isToggling}
            data-testid={VIEWER_TEST_IDS.TOGGLE_ACTIVE_BUTTON}
            aria-label={
              viewer.active ? `視聴者を無効化: ${viewer.name}` : `視聴者を再有効化: ${viewer.name}`
            }
          >
            {viewer.active ? (
              <>
                <UserRoundX className="mr-1 h-4 w-4" />
                無効化
              </>
            ) : (
              <>
                <UserRoundCheck className="mr-1 h-4 w-4" />
                再有効化
              </>
            )}
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onEdit(viewer)}
            data-testid={VIEWER_TEST_IDS.EDIT_BUTTON}
            aria-label={`視聴者を編集: ${viewer.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-console-ink-weak hover:text-destructive"
            onClick={() => onDelete(viewer)}
            data-testid={VIEWER_TEST_IDS.DELETE_BUTTON}
            aria-label={`視聴者を削除: ${viewer.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
