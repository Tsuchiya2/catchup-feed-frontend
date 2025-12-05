'use client';

import * as React from 'react';
import { Rss } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SourceCard } from '@/components/sources/SourceCard';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useSources } from '@/hooks/useSources';

/**
 * Sources List Page
 *
 * Protected page that displays a grid of RSS/Atom feed sources.
 * This is a read-only page - source management is admin-only.
 * Requires authentication - unauthenticated users will be redirected by middleware.
 */
export default function SourcesPage() {
  // Fetch sources
  const { sources, isLoading, error, refetch } = useSources();

  return (
    <div className="container py-8">
      {/* Page Header */}
      <PageHeader title="Sources" description="RSS/Atom feeds being tracked" />

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
          title="No sources configured"
          description="Feed sources will appear here once they are added by the administrator."
          icon={<Rss className="h-12 w-12" />}
        />
      )}

      {/* Success State - Sources Grid */}
      {!isLoading && !error && sources.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>

          {/* Total Count */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Total: {sources.length} source{sources.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
