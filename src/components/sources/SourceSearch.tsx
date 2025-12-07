/**
 * SourceSearch Component
 *
 * Search and filter panel for sources with keyword search,
 * type filter, and active status filter.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search/SearchInput';
import { TypeFilter } from '@/components/search/TypeFilter';
import { ActiveFilter } from '@/components/search/ActiveFilter';
import { cn } from '@/lib/utils';
import type { SourceSearchParams } from '@/lib/api/endpoints/sources';

export interface SourceSearchState {
  keyword: string;
  sourceType: string | null;
  active: boolean | null;
}

export interface SourceSearchProps {
  /** Current search state */
  searchState: SourceSearchState;
  /** Callback when search state changes */
  onSearchChange: (state: SourceSearchState) => void;
  /** Whether search is in progress */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Convert SourceSearchState to SourceSearchParams
 */
export function toSearchParams(state: SourceSearchState): SourceSearchParams {
  return {
    keyword: state.keyword || undefined,
    source_type: state.sourceType ?? undefined,
    active: state.active ?? undefined,
  };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(state: SourceSearchState): boolean {
  return !!(state.keyword || state.sourceType || state.active !== null);
}

/**
 * SourceSearch component
 *
 * @example
 * ```tsx
 * const [searchState, setSearchState] = useState<SourceSearchState>({
 *   keyword: '',
 *   sourceType: null,
 *   active: null,
 * });
 *
 * <SourceSearch
 *   searchState={searchState}
 *   onSearchChange={setSearchState}
 *   isLoading={isSearching}
 * />
 * ```
 */
export function SourceSearch({
  searchState,
  onSearchChange,
  isLoading = false,
  className,
}: SourceSearchProps) {
  const handleKeywordChange = React.useCallback(
    (keyword: string) => {
      onSearchChange({ ...searchState, keyword });
    },
    [searchState, onSearchChange]
  );

  const handleTypeChange = React.useCallback(
    (sourceType: string | null) => {
      onSearchChange({ ...searchState, sourceType });
    },
    [searchState, onSearchChange]
  );

  const handleActiveChange = React.useCallback(
    (active: boolean | null) => {
      onSearchChange({ ...searchState, active });
    },
    [searchState, onSearchChange]
  );

  const handleClearAll = React.useCallback(() => {
    onSearchChange({
      keyword: '',
      sourceType: null,
      active: null,
    });
  }, [onSearchChange]);

  const showClearButton = React.useMemo(() => hasActiveFilters(searchState), [searchState]);

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Search & Filter Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyword Search */}
        <SearchInput
          value={searchState.keyword}
          onChange={handleKeywordChange}
          placeholder="Search by name or URL..."
          isLoading={isLoading}
        />

        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Type Filter */}
          <TypeFilter value={searchState.sourceType} onChange={handleTypeChange} />

          {/* Active Filter */}
          <ActiveFilter value={searchState.active} onChange={handleActiveChange} />
        </div>

        {/* Clear All Button */}
        {showClearButton && (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
