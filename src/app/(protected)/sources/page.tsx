'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Rss, Search } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { SourceCard } from '@/components/sources/SourceCard';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddSourceDialog } from '@/components/sources/AddSourceDialog';
import { EditSourceDialog } from '@/components/sources/EditSourceDialog';
import { DeleteSourceDialog } from '@/components/sources/DeleteSourceDialog';
import { useSources } from '@/hooks/useSources';
import { useSourceSearch } from '@/hooks/useSourceSearch';
import { useMe } from '@/hooks/useAuth';
import { updateSourceActive } from '@/lib/api/endpoints/sources';
import {
  SourceSearch,
  type SourceSearchState,
  toSearchParams,
  hasActiveFilters,
} from '@/components/sources/SourceSearch';
import type { Source } from '@/types/api';

/**
 * Sources List Page Content
 *
 * Wrapped in Suspense boundary for useSearchParams compatibility.
 */
function SourcesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Role gating (D-27): viewers get a read-only list of active sources
  // (the backend force-filters GET /sources and 403s search/mutations).
  // Until the role is known we render the read-only variant so admin-only
  // controls never flash for a viewer.
  const { role } = useMe();
  const isAdmin = role === 'admin';

  // Add Source Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // Edit Source Dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<Source | null>(null);

  // Delete Source Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sourceToDelete, setSourceToDelete] = React.useState<Source | null>(null);

  // Get search parameters from URL
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || null;
  const activeParam = searchParams.get('active');
  const active = activeParam === null ? null : activeParam === 'true';

  // Search state
  const [searchState, setSearchState] = React.useState<SourceSearchState>({
    keyword,
    category,
    active,
  });

  // Determine if we're in search mode (admin only — GET /sources/search is
  // 403 for viewers, so a viewer never issues search requests)
  const isSearchMode = isAdmin && hasActiveFilters(searchState);

  // Fetch sources - conditionally enable based on mode to prevent duplicate API calls
  const listResult = useSources({ enabled: !isSearchMode });

  const searchResult = useSourceSearch(toSearchParams(searchState), { enabled: isSearchMode });

  // Use appropriate result based on mode
  const { sources, isLoading, error, refetch } = isSearchMode ? searchResult : listResult;

  // Update URL when search state changes
  React.useEffect(() => {
    const params = new URLSearchParams();

    if (searchState.keyword) {
      params.set('keyword', searchState.keyword);
    }
    if (searchState.category) {
      params.set('category', searchState.category);
    }
    if (searchState.active !== null) {
      params.set('active', searchState.active.toString());
    }

    const queryString = params.toString();
    router.push(queryString ? `/sources?${queryString}` : '/sources');
  }, [searchState, router]);

  // Query client for cache manipulation
  const queryClient = useQueryClient();

  // Mutation for updating source active status with optimistic updates
  const mutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return updateSourceActive(id, active);
    },
    onMutate: async ({ id, active }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['sources'] });

      // Snapshot previous value for rollback
      const previousSources = queryClient.getQueryData<Source[]>(['sources']);

      // Optimistically update cache
      queryClient.setQueryData<Source[]>(['sources'], (old) => {
        if (!old) return old;
        return old.map((source) => (source.id === id ? { ...source, active } : source));
      });

      // Return context with previous value
      return { previousSources };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousSources) {
        queryClient.setQueryData(['sources'], context.previousSources);
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  /**
   * Handle source active status update
   * Called by SourceCard's ActiveToggle component
   */
  const handleUpdateActive = React.useCallback(
    async (sourceId: number, active: boolean) => {
      await mutation.mutateAsync({ id: sourceId, active });
    },
    [mutation]
  );

  /**
   * Handle source edit
   * Opens the EditSourceDialog with the selected source
   */
  const handleEditSource = React.useCallback((source: Source) => {
    setSelectedSource(source);
    setEditDialogOpen(true);
  }, []);

  /**
   * Handle edit dialog close
   * Resets the selected source and closes the dialog
   */
  const handleEditDialogClose = React.useCallback(() => {
    setSelectedSource(null);
    setEditDialogOpen(false);
  }, []);

  /**
   * Handle source delete
   * Opens the DeleteSourceDialog with the selected source
   */
  const handleDeleteSource = React.useCallback((source: Source) => {
    setSourceToDelete(source);
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Handle delete dialog close
   * Resets the source to delete and closes the dialog
   */
  const handleDeleteDialogClose = React.useCallback(() => {
    setSourceToDelete(null);
    setDeleteDialogOpen(false);
  }, []);

  /**
   * Handle delete dialog success
   * Resets the source to delete and closes the dialog
   */
  const handleDeleteDialogSuccess = React.useCallback(() => {
    setSourceToDelete(null);
    setDeleteDialogOpen(false);
  }, []);

  return (
    <div className="container py-8">
      {/* Page Header with Add Button (admin only) */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader title="Sources" description="RSS/Atom feeds being tracked" />

        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        )}
      </div>

      {/* Search and Filter Panel (admin only — search is 403 for viewers) */}
      {isAdmin && (
        <SourceSearch
          searchState={searchState}
          onSearchChange={setSearchState}
          isLoading={isLoading}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sources.length === 0 && (
        <EmptyState
          title={isSearchMode ? 'No sources found' : 'No sources configured'}
          description={
            isSearchMode
              ? 'Try adjusting your search keywords or filters.'
              : 'Feed sources will appear here once they are added by the administrator.'
          }
          icon={isSearchMode ? <Search className="h-12 w-12" /> : <Rss className="h-12 w-12" />}
        />
      )}

      {/* Success State - Sources Grid */}
      {!isLoading && !error && sources.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) =>
              isAdmin ? (
                <SourceCard
                  key={source.id}
                  source={source}
                  onUpdateActive={handleUpdateActive}
                  onEdit={handleEditSource}
                  onDelete={handleDeleteSource}
                />
              ) : (
                // Viewer (D-27): no handlers → SourceCard renders its
                // read-only variant (StatusBadge, no edit/delete/toggle)
                <SourceCard key={source.id} source={source} />
              )
            )}
          </div>

          {/* Total Count */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Total: {sources.length} source{sources.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Add Source Dialog */}
      <AddSourceDialog
        isOpen={isAdmin && isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => setIsAddDialogOpen(false)}
      />

      {/* Edit Source Dialog */}
      {isAdmin && selectedSource && (
        <EditSourceDialog
          isOpen={editDialogOpen}
          onClose={handleEditDialogClose}
          source={selectedSource}
        />
      )}

      {/* Delete Source Dialog */}
      {isAdmin && sourceToDelete && (
        <DeleteSourceDialog
          isOpen={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
          source={sourceToDelete}
          onSuccess={handleDeleteDialogSuccess}
        />
      )}
    </div>
  );
}

/**
 * Sources List Page
 *
 * Protected page that displays a grid of RSS/Atom feed sources.
 * The admin (C-7) gets full management controls; `viewer` accounts (D-27)
 * get a read-only list of active sources — the backend force-filters
 * GET /sources and rejects search/mutations with 403, so the UI gating
 * here is presentation only.
 * Requires authentication - unauthenticated users will be redirected by the proxy.
 *
 * Wrapped in Suspense boundary for useSearchParams compatibility with Next.js 15.
 */
export default function SourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <PageHeader title="Sources" description="RSS/Atom feeds being tracked" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <SourcesPageContent />
    </Suspense>
  );
}
