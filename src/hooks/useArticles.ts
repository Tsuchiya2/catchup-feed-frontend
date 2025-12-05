/**
 * useArticles Hook
 *
 * Custom React hook for fetching articles with pagination and filtering.
 * Uses React Query for cache management with 60s stale time.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/lib/api/endpoints/articles';
import type { Article, ArticlesQuery } from '@/types/api';

/**
 * Pagination information
 */
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Articles hook return type
 */
interface UseArticlesReturn {
  /** Array of articles */
  articles: Article[];
  /** Pagination information */
  pagination: PaginationInfo;
  /** Whether the articles are being fetched */
  isLoading: boolean;
  /** Error from the last fetch attempt, or null */
  error: Error | null;
  /** Function to manually refetch articles */
  refetch: () => void;
}

/**
 * Custom hook for fetching articles
 *
 * @param query - Query parameters (page, limit, sourceId)
 * @returns Articles data, pagination, loading state, and refetch function
 *
 * @example
 * ```typescript
 * function ArticlesList() {
 *   const { articles, pagination, isLoading, error, refetch } = useArticles({
 *     page: 1,
 *     limit: 10,
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {articles.map((article) => (
 *         <div key={article.id}>{article.title}</div>
 *       ))}
 *       <p>Total: {pagination.total}</p>
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useArticles(query?: ArticlesQuery): UseArticlesReturn {
  // Query key includes filter params for cache isolation
  const queryKey = ['articles', query ?? {}];

  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getArticles(query);
      return response;
    },
    staleTime: 60000, // 60 seconds
    retry: 1,
    refetchOnWindowFocus: true,
  });

  // Default pagination values
  // Note: Backend returns array directly, so we calculate pagination from array length
  const defaultPagination: PaginationInfo = {
    page: query?.page ?? 1,
    limit: query?.limit ?? 10,
    total: 0,
    totalPages: 0,
  };

  const refetch = () => {
    refetchQuery();
  };

  // Backend returns array directly, not wrapped in object
  const articles = Array.isArray(data) ? data : [];
  const total = articles.length;

  return {
    articles,
    pagination: {
      page: query?.page ?? 1,
      limit: query?.limit ?? 10,
      total,
      totalPages: Math.ceil(total / (query?.limit ?? 10)),
    },
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
