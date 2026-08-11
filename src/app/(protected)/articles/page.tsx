'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useArticles } from '@/hooks/useArticles';
import { useArticleSearch } from '@/hooks/useArticleSearch';
import {
  ArticleSearch,
  type ArticleSearchState,
  toSearchParams,
  hasActiveFilters,
} from '@/components/articles/ArticleSearch';
import { PAGINATION_CONFIG } from '@/lib/constants/pagination';
import { validatePaginationParams } from '@/lib/api/utils/pagination';

/**
 * Articles list — 放送卓(改訂版)
 *
 * Console list form: a 1px-framed panel with hairline-divided rows
 * (design handoff 未着手の画面). Search / filter sits in its own panel.
 */

/** Hairline-framed loading rows (README ローディング: no pulse, `—` only). */
function LoadingRows({ count = 8 }: { count?: number }) {
  return (
    <div className="border border-console-line-2 bg-console-panel" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 last:border-b-0"
        >
          <span className="w-[72px] shrink-0 font-mono text-[11.5px] text-console-ink-ghost">
            —
          </span>
          <span className="min-h-[20px] flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Articles List Page Content
 *
 * Wrapped in Suspense boundary for useSearchParams compatibility.
 */
function ArticlesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get pagination parameters from URL with validation
  const validatedParams = validatePaginationParams(new URLSearchParams(searchParams.toString()));
  const { page, limit } = validatedParams;

  // Get search parameters from URL
  const keyword = searchParams.get('keyword') || '';
  const sourceId = searchParams.get('source_id')
    ? parseInt(searchParams.get('source_id')!, 10)
    : null;
  const fromDate = searchParams.get('from') || null;
  const toDate = searchParams.get('to') || null;

  // Search state
  const [searchState, setSearchState] = React.useState<ArticleSearchState>({
    keyword,
    sourceId,
    fromDate,
    toDate,
  });

  // Determine if we're in search mode
  const isSearchMode = hasActiveFilters(searchState);

  // Fetch articles - conditionally enable based on mode to prevent duplicate API calls
  const listResult = useArticles(
    {
      page,
      limit,
    },
    { enabled: !isSearchMode }
  );

  const searchResult = useArticleSearch(
    {
      ...toSearchParams(searchState),
      page,
      limit,
    },
    { enabled: isSearchMode }
  );

  // Use appropriate result based on mode
  const { articles, pagination, isLoading, error, refetch } = isSearchMode
    ? searchResult
    : listResult;

  // Redirect if page exceeds total pages
  React.useEffect(() => {
    if (!isLoading && pagination.totalPages > 0 && pagination.page > pagination.totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', pagination.totalPages.toString());
      router.replace(`/articles?${params.toString()}`);
    }
  }, [pagination.page, pagination.totalPages, isLoading, searchParams, router]);

  // Update URL when search state changes
  React.useEffect(() => {
    const params = new URLSearchParams();

    if (searchState.keyword) {
      params.set('keyword', searchState.keyword);
    }
    if (searchState.sourceId) {
      params.set('source_id', searchState.sourceId.toString());
    }
    if (searchState.fromDate) {
      params.set('from', searchState.fromDate);
    }
    if (searchState.toDate) {
      params.set('to', searchState.toDate);
    }
    params.set('page', '1'); // Reset to page 1 when filters change
    params.set('limit', limit.toString());

    router.push(`/articles?${params.toString()}`);
  }, [searchState, limit, router]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/articles?${params.toString()}`);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
      {/* Page Header */}
      <PageHeader title="記事" description={isLoading ? '— 件' : `全 ${pagination.total} 件`} />

      {/* Search and Filter Panel */}
      <ArticleSearch
        searchState={searchState}
        onSearchChange={setSearchState}
        isLoading={isLoading}
      />

      {/* Error State */}
      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {/* Loading State */}
      {isLoading && <LoadingRows />}

      {/* Empty State */}
      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          title={isSearchMode ? '該当する記事がありません' : '記事はまだありません'}
          description={
            isSearchMode
              ? 'キーワードや絞り込み条件を変えてみてください。'
              : 'クローラーが収集した記事がここに並びます。'
          }
          icon={
            isSearchMode ? <Search className="h-10 w-10" /> : <FileText className="h-10 w-10" />
          }
        />
      )}

      {/* Success State - Articles List */}
      {!isLoading && !error && articles.length > 0 && (
        <>
          <div className="border border-console-line-2 bg-console-panel">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-3">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onItemsPerPageChange={handleItemsPerPageChange}
                availablePageSizes={PAGINATION_CONFIG.AVAILABLE_PAGE_SIZES}
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
        <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:px-8 desk:py-7">
          <PageHeader title="記事" description="— 件" />
          <LoadingRows />
        </div>
      }
    >
      <ArticlesPageContent />
    </Suspense>
  );
}
