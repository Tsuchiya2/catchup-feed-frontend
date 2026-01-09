/**
 * SourceFilter Component
 *
 * Dropdown filter for selecting a source to filter articles.
 * Fetches available sources from the API.
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSources } from '@/hooks/useSources';
import { filterSources, sourceFilters, type SourceFilterPredicate } from '@/utils/sourceFilters';
import { logger } from '@/lib/logger';

export interface SourceFilterProps {
  /** Currently selected source ID */
  value: number | null;
  /** Callback when source selection changes */
  onChange: (sourceId: number | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the select */
  disabled?: boolean;
  /**
   * Optional filter predicate to filter available sources
   * @default sourceFilters.active - Only show active sources
   * @example
   * // Show all sources (no filtering)
   * <SourceFilter filterPredicate={sourceFilters.all} />
   */
  filterPredicate?: SourceFilterPredicate;
}

/**
 * SourceFilter component
 *
 * @example
 * ```tsx
 * const [sourceId, setSourceId] = useState<number | null>(null);
 *
 * <SourceFilter
 *   value={sourceId}
 *   onChange={setSourceId}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Show all sources (including inactive)
 * <SourceFilter
 *   value={sourceId}
 *   onChange={setSourceId}
 *   filterPredicate={sourceFilters.all}
 * />
 * ```
 */
export function SourceFilter({
  value,
  onChange,
  className,
  disabled = false,
  filterPredicate = sourceFilters.active,
}: SourceFilterProps) {
  const { sources, isLoading } = useSources();

  // Apply filtering with default to active sources
  const filteredSources = React.useMemo(() => {
    return filterSources(sources, filterPredicate);
  }, [sources, filterPredicate]);

  // Observability logging - log when sources are filtered
  React.useEffect(() => {
    if (sources.length === 0) return; // Don't log when sources not loaded yet

    const activeSourceCount = filteredSources.length;
    const totalSources = sources.length;
    const filterRatio = totalSources > 0 ? activeSourceCount / totalSources : 0;

    if (activeSourceCount === 0) {
      logger.warn('SourceFilter: All sources filtered out', {
        component: 'SourceFilter',
        totalSources,
        activeSourceCount,
        filterRatio,
      });
    } else {
      logger.debug('SourceFilter: Sources filtered', {
        component: 'SourceFilter',
        totalSources,
        activeSourceCount,
        filterRatio,
      });
    }
  }, [sources, filteredSources]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue ? parseInt(selectedValue, 10) : null);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor="source-filter" className="text-sm font-medium">
        Source
      </Label>
      <select
        id="source-filter"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Filter by source"
      >
        <option value="">All Sources</option>
        {filteredSources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>
    </div>
  );
}
