/**
 * useSources Hook
 *
 * Custom React hook for fetching sources list.
 * Uses React Query for cache management with 60s stale time.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getSources } from '@/lib/api/endpoints/sources';
import type { Source } from '@/types/api';

/**
 * Sources hook return type
 */
interface UseSourcesReturn {
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
 * Custom hook for fetching sources
 *
 * @returns Sources data, loading state, and refetch function
 *
 * @example
 * ```typescript
 * function SourcesList() {
 *   const { sources, isLoading, error, refetch } = useSources();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {sources.map((source) => (
 *         <div key={source.id}>{source.name}</div>
 *       ))}
 *       <button onClick={() => refetch()}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSources(): UseSourcesReturn {
  const queryKey = ['sources'];

  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getSources();
      return response;
    },
    staleTime: 60000, // 60 seconds
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const refetch = () => {
    refetchQuery();
  };

  // Backend returns array directly, not wrapped in object
  const sources = Array.isArray(data) ? data : [];

  return {
    sources,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
