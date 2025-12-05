/**
 * useDashboardStats Hook
 *
 * Composite React Query hook that combines articles and sources data
 * to provide dashboard statistics.
 */

'use client';

import { useArticles } from './useArticles';
import { useSources } from './useSources';
import type { Article } from '@/types/api';

/**
 * Dashboard statistics
 */
interface DashboardStats {
  /** Total number of articles */
  totalArticles: number;
  /** Total number of sources */
  totalSources: number;
  /** Recent articles (up to 10) */
  recentArticles: Article[];
}

/**
 * Dashboard stats hook return type
 */
interface UseDashboardStatsReturn {
  /** Dashboard statistics */
  stats: DashboardStats;
  /** Whether any of the data is being fetched */
  isLoading: boolean;
  /** Error from the last fetch attempt, or null (prioritizes articles error) */
  error: Error | null;
}

/**
 * Custom hook for fetching dashboard statistics
 *
 * Combines articles and sources queries to provide aggregated statistics
 * for the dashboard page.
 *
 * @returns Dashboard statistics, loading state, and error state
 *
 * @example
 * ```typescript
 * function DashboardPage() {
 *   const { stats, isLoading, error } = useDashboardStats();
 *
 *   if (isLoading) return <div>Loading dashboard...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>Dashboard</h1>
 *       <p>Total Articles: {stats.totalArticles}</p>
 *       <p>Total Sources: {stats.totalSources}</p>
 *       <h2>Recent Articles</h2>
 *       {stats.recentArticles.map((article) => (
 *         <div key={article.id}>{article.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  // Fetch recent articles (limit to 10)
  const {
    articles: recentArticles,
    pagination,
    isLoading: articlesLoading,
    error: articlesError,
  } = useArticles({ limit: 10 });

  // Fetch sources
  const { sources, isLoading: sourcesLoading, error: sourcesError } = useSources();

  // Combine statistics
  const stats: DashboardStats = {
    totalArticles: pagination.total,
    totalSources: sources.length,
    recentArticles,
  };

  // Loading is true if either query is loading
  const isLoading = articlesLoading || sourcesLoading;

  // Prioritize articles error over sources error
  const error = articlesError || sourcesError;

  return {
    stats,
    isLoading,
    error,
  };
}
