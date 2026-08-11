'use client';

import * as React from 'react';
import { Eye, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';
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
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      {/* Page Header with Add button */}
      <PageHeader
        title="視聴者"
        description={
          isLoading
            ? '— 名'
            : viewers.length > 0
              ? `有効 ${activeCount} 名${inactiveCount > 0 ? ` ／ 無効化 ${inactiveCount} 名` : ''}`
              : 'ソース一覧を閲覧できる読み取り専用アカウント'
        }
        action={
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            視聴者を追加
          </Button>
        }
      />

      {/* List fetch error */}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Activate/deactivate toggle error */}
      <ErrorAlert error={toggleActive.error} />

      {/* Loading State */}
      {isLoading && (
        <div className="border border-console-line-2 bg-console-panel" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
            >
              <span className="min-h-[34px] flex-1" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && viewers.length === 0 && (
        <EmptyState
          title="視聴者はまだいません"
          description="読み取り専用アカウントを作ると、友人がソース一覧を見て「これを足して」「これは要らない」と言えるようになります。"
          icon={<Eye className="h-10 w-10" />}
          action={
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              視聴者を追加
            </Button>
          }
        />
      )}

      {/* Viewers list */}
      {!isLoading && !error && viewers.length > 0 && (
        <div className="border border-console-line-2 bg-console-panel" role="list">
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
