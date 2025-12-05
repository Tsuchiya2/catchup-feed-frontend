'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles } from '@/hooks/useArticles';

/**
 * Articles List Page Content
 *
 * Wrapped in Suspense boundary for useSearchParams compatibility.
 */
function ArticlesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get pagination parameters from URL
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  // Fetch articles with current pagination
  const { articles, pagination, isLoading, error, refetch } = useArticles({
    page,
    limit,
  });

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="container py-8">
      {/* Page Header */}
      <PageHeader title="Articles" description="Browse all articles from your sources" />

      {/* Error State */}
      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onRetry={refetch} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title="No articles yet"
          description="Articles will appear here once they are added by the feed crawler."
          icon={<FileText className="h-12 w-12" />}
        />
      )}

      {/* Success State - Articles List */}
      {!isLoading && !error && articles.length > 0 && (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Articles List Page
 *
 * Protected page that displays a paginated list of all articles.
 * Requires authentication - unauthenticated users will be redirected by middleware.
 *
 * Wrapped in Suspense boundary for useSearchParams compatibility with Next.js 15.
 */
export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <PageHeader title="Articles" description="Browse all articles from your sources" />
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ArticlesPageContent />
    </Suspense>
  );
}
