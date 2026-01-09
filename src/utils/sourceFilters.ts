/**
 * Source Filter Utilities
 *
 * Provides predicate-based filtering utilities for Source entities.
 * Supports extensible filtering without component modification.
 */

import type { Source } from '@/types/api';

/**
 * SourceFilterPredicate - Function type for filtering sources
 *
 * Enables extensible filtering without component modification.
 * Predicates can be composed using composeFilters() for complex scenarios.
 *
 * @param source - Source entity to evaluate
 * @returns true if source passes the filter, false otherwise
 *
 * @example
 * const activeFilter: SourceFilterPredicate = (source) => source.active === true;
 * const filtered = sources.filter(activeFilter);
 */
export type SourceFilterPredicate = (source: Source) => boolean;

/**
 * Pre-defined filter predicates registry
 *
 * New filters can be added here without modifying SourceFilter component.
 * All predicates follow the SourceFilterPredicate type signature.
 *
 * @example
 * import { sourceFilters, filterSources } from '@/utils/sourceFilters';
 * const activeSources = filterSources(sources, sourceFilters.active);
 */
export const sourceFilters = {
  /**
   * Filter to include only active sources
   *
   * Uses explicit === true comparison to handle edge cases
   * where active field might be undefined or truthy/falsy values.
   *
   * @param source - Source entity to evaluate
   * @returns true if source.active === true, false otherwise
   */
  active: (source: Source): boolean => source.active === true,

  /**
   * Include all sources (no filtering)
   *
   * Pass-through predicate that always returns true.
   * Useful as a default or when filtering needs to be disabled.
   *
   * @param _source - Source entity (unused)
   * @returns always true
   */
  all: (_source: Source): boolean => true,
} as const;

/**
 * Helper to filter sources with a predicate
 *
 * Extracted for reusability and testability.
 * Provides a consistent interface for filtering sources across the application.
 *
 * @param sources - Array of Source entities to filter
 * @param predicate - Filter predicate function (default: sourceFilters.active)
 * @returns Filtered array of Source entities
 *
 * @example
 * // Filter to active sources (default)
 * const activeSources = filterSources(sources);
 *
 * @example
 * // Use custom predicate
 * const recentSources = filterSources(sources, (s) =>
 *   s.last_crawled_at && new Date(s.last_crawled_at) > yesterday
 * );
 *
 * @example
 * // Show all sources
 * const allSources = filterSources(sources, sourceFilters.all);
 */
export const filterSources = (
  sources: Source[],
  predicate: SourceFilterPredicate = sourceFilters.active
): Source[] => sources.filter(predicate);

/**
 * Compose multiple predicates with AND/OR logic
 *
 * Supports compound filter scenarios by combining multiple predicates.
 * Useful for complex filtering requirements without creating new predicates.
 *
 * @param predicates - Array of predicates to combine
 * @param mode - Logic mode: 'AND' (all must pass) or 'OR' (at least one must pass)
 * @returns Combined predicate function
 *
 * @example
 * // AND mode: source must be active AND recently crawled
 * const activeAndRecent = composeFilters([
 *   sourceFilters.active,
 *   (s) => s.last_crawled_at && new Date(s.last_crawled_at) > yesterday
 * ], 'AND');
 *
 * @example
 * // OR mode: source can be active OR from specific category
 * const activeOrCategory = composeFilters([
 *   sourceFilters.active,
 *   (s) => s.name.includes('Tech')
 * ], 'OR');
 */
export const composeFilters = (
  predicates: SourceFilterPredicate[],
  mode: 'AND' | 'OR' = 'AND'
): SourceFilterPredicate => {
  return (source: Source) => {
    if (mode === 'AND') {
      return predicates.every((pred) => pred(source));
    }
    return predicates.some((pred) => pred(source));
  };
};
