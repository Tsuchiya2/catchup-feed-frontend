/**
 * ViewerCard Component
 *
 * Displays a read-only viewer account (D-27) in a card format:
 * - Name + active/deactivated badge (logical deactivation, reversible)
 * - Login email
 * - Added date
 * - Edit, activate/deactivate toggle, and delete (PHYSICAL) actions
 */
import * as React from 'react';
import { Eye, Pencil, Trash2, UserRoundCheck, UserRoundX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/formatDate';
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
 * ViewerCard displays a viewer account in a card format.
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
    <Card
      className={cn('flex flex-col', !viewer.active && 'opacity-70', className)}
      role="listitem"
      aria-label={`Viewer: ${viewer.name}`}
      data-testid={VIEWER_TEST_IDS.CARD}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        {/* Icon, name, status */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-foreground">{viewer.name}</h3>
              {viewer.active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">
                  Deactivated
                  {viewer.deactivated_at ? ` ${formatRelativeTime(viewer.deactivated_at)}` : ''}
                </Badge>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground" title={viewer.email}>
              {viewer.email}
            </p>
          </div>
        </div>

        {/* Footer: added date + actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <time className="text-xs text-muted-foreground" dateTime={viewer.created_at || undefined}>
            Added {formatRelativeTime(viewer.created_at)}
          </time>
          <div className="flex items-center gap-1">
            {onToggleActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleActive(viewer)}
                disabled={isToggling}
                data-testid={VIEWER_TEST_IDS.TOGGLE_ACTIVE_BUTTON}
                aria-label={
                  viewer.active
                    ? `Deactivate viewer: ${viewer.name}`
                    : `Reactivate viewer: ${viewer.name}`
                }
              >
                {viewer.active ? (
                  <>
                    <UserRoundX className="mr-1 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserRoundCheck className="mr-1 h-4 w-4" />
                    Reactivate
                  </>
                )}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(viewer)}
                data-testid={VIEWER_TEST_IDS.EDIT_BUTTON}
                aria-label={`Edit viewer: ${viewer.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(viewer)}
                data-testid={VIEWER_TEST_IDS.DELETE_BUTTON}
                aria-label={`Delete viewer: ${viewer.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
