/**
 * useArticle Hook
 *
 * Custom React hook for fetching a single article by ID.
 * Uses React Query for cache management with 60s stale time.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getArticle } from '@/lib/api/endpoints/articles';
import type { Article } from '@/types/api';

/**
 * Article hook return type
 */
interface UseArticleReturn {
  /** The article data, or null if not loaded */
  article: Article | null;
  /** Whether the article is being fetched */
  isLoading: boolean;
  /** Error from the last fetch attempt, or null */
  error: Error | null;
  /** Function to manually refetch the article */
  refetch: () => void;
}

/**
 * Custom hook for fetching a single article by ID
 *
 * @param id - Article ID (number)
 * @returns Article data, loading state, error, and refetch function
 *
 * @example
 * ```typescript
 * function ArticleDetail({ id }: { id: number }) {
 *   const { article, isLoading, error, refetch } = useArticle(id);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!article) return <div>Article not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{article.title}</h1>
 *       <p>{article.summary}</p>
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useArticle(id: number): UseArticleReturn {
  // Query key includes article ID for cache isolation
  const queryKey = ['article', id];

  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getArticle(id);
      return response;
    },
    staleTime: 60000, // 60 seconds
    retry: 1,
    refetchOnWindowFocus: true,
    // Don't fetch if ID is invalid
    enabled: id > 0,
  });

  const refetch = () => {
    refetchQuery();
  };

  return {
    article: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
