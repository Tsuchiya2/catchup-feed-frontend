'use client';

import * as React from 'react';
import { Eye, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ViewerCard } from '@/components/viewers/ViewerCard';
import { AddViewerDialog } from '@/components/viewers/AddViewerDialog';
import { EditViewerDialog } from '@/components/viewers/EditViewerDialog';
import { DeleteViewerDialog } from '@/components/viewers/DeleteViewerDialog';
import { useViewers, useSetViewerActive } from '@/hooks/useViewers';
import type { Viewer } from '@/types/api';

/**
 * Viewers (read-only accounts) list page — admin only (D-27).
 *
 * CRUD for friend accounts that can log in and browse the active source
 * list. Deactivation is a reversible logical toggle (takes effect on the
 * viewer's next request); deletion is PHYSICAL and confirmed via dialog.
 * The proxy redirects viewer-role sessions away from this page, and every
 * /viewers API is admin-only server-side.
 */
export default function ViewersPage() {
  const { viewers, isLoading, error, refetch } = useViewers();
  const toggleActive = useSetViewerActive();

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [viewerToEdit, setViewerToEdit] = React.useState<Viewer | null>(null);
  const [viewerToDelete, setViewerToDelete] = React.useState<Viewer | null>(null);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);

  const activeCount = viewers.filter((v) => v.active).length;
  const inactiveCount = viewers.length - activeCount;

  /**
   * Toggle active/deactivated directly from the card. No confirmation
   * dialog: the operation is reversible (unlike delete). Errors surface
   * via the ErrorAlert below the header.
   */
  const handleToggleActive = React.useCallback(
    async (viewer: Viewer) => {
      setTogglingId(viewer.id);
      try {
        await toggleActive.mutateAsync({ id: viewer.id, active: !viewer.active });
      } catch {
        // Error surfaces through toggleActive.error
      } finally {
        setTogglingId(null);
      }
    },
    [toggleActive]
  );

  return (
    <div className="container py-8">
      {/* Page Header with Add button */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Viewers"
          description={
            viewers.length > 0
              ? `${activeCount} active${inactiveCount > 0 ? `, ${inactiveCount} deactivated` : ''}`
              : 'Read-only accounts for friends to browse the source list'
          }
        />
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Viewer
        </Button>
      </div>

      {/* List fetch error */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {/* Activate/deactivate toggle error */}
      <ErrorAlert error={toggleActive.error} />

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && viewers.length === 0 && (
        <EmptyState
          title="No viewers yet"
          description="Create a read-only account so a friend can browse your source list and tell you what to add or drop."
          icon={<Eye className="h-12 w-12" />}
          action={
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Viewer
            </Button>
          }
        />
      )}

      {/* Viewers grid */}
      {!isLoading && !error && viewers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
          {viewers.map((viewer) => (
            <ViewerCard
              key={viewer.id}
              viewer={viewer}
              onEdit={setViewerToEdit}
              onToggleActive={handleToggleActive}
              onDelete={setViewerToDelete}
              isToggling={togglingId === viewer.id}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddViewerDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditViewerDialog
        viewer={viewerToEdit}
        isOpen={viewerToEdit !== null}
        onClose={() => setViewerToEdit(null)}
      />
      <DeleteViewerDialog
        viewer={viewerToDelete}
        isOpen={viewerToDelete !== null}
        onClose={() => setViewerToDelete(null)}
      />
    </div>
  );
}
