/**
 * useSourceSearch Hook
 *
 * Custom React hook for searching sources with multi-keyword and filters.
 * Uses React Query for cache management with 60s stale time.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { searchSources } from '@/lib/api/endpoints/sources';
import type { Source } from '@/types/api';
import type { SourceSearchParams } from '@/lib/api/endpoints/sources';

/**
 * Source search hook return type
 */
interface UseSourceSearchReturn {
  /** Array of sources */
  sources: Source[];
  /** Whether the sources are being fetched */
  isLoading: boolean;
  /** Error from the last fetch attempt, or null */
  error: Error | null;
  /** Function to manually refetch sources */
  refetch: () => void;
}

/**
 * Hook options
 */
interface UseSourceSearchOptions {
  /** Whether the query should be enabled (default: true) */
  enabled?: boolean;
}

/**
 * Custom hook for searching sources
 *
 * @param params - Search parameters (keyword, source_type, active)
 * @param options - Hook options (enabled)
 * @returns Sources data, loading state, and refetch function
 *
 * @example
 * ```typescript
 * function SourceSearch() {
 *   const [params, setParams] = useState<SourceSearchParams>({
 *     keyword: 'Tech',
 *     source_type: 'RSS',
 *     active: true,
 *   });
 *
 *   const { sources, isLoading, error } = useSourceSearch(params, { enabled: true });
 *
 *   return (
 *     <div>
 *       {sources.map((source) => (
 *         <SourceCard key={source.id} source={source} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSourceSearch(
  params?: SourceSearchParams,
  options?: UseSourceSearchOptions
): UseSourceSearchReturn {
  // Query key includes all search params for cache isolation
  const queryKey = ['sources', 'search', params ?? {}];

  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await searchSources(params);
      return response;
    },
    staleTime: 60000, // 60 seconds
    retry: 1,
    refetchOnWindowFocus: true,
    enabled: options?.enabled ?? true,
  });

  const refetch = () => {
    refetchQuery();
  };

  // Backend returns array directly
  const sources = Array.isArray(data) ? data : [];

  return {
    sources,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// Re-export types for convenience
export type { SourceSearchParams };
