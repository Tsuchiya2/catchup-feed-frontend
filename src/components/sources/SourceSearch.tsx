/**
 * SourceSearch Component
 *
 * Search and filter panel for sources with keyword search,
 * category filter, and active status filter.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search/SearchInput';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { ActiveFilter } from '@/components/search/ActiveFilter';
import { cn } from '@/lib/utils';
import type { SourceSearchParams } from '@/lib/api/endpoints/sources';

export interface SourceSearchState {
  keyword: string;
  category: string | null;
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
    category: state.category ?? undefined,
    active: state.active ?? undefined,
  };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(state: SourceSearchState): boolean {
  return !!(state.keyword || state.category || state.active !== null);
}

/**
 * SourceSearch component
 *
 * @example
 * ```tsx
 * const [searchState, setSearchState] = useState<SourceSearchState>({
 *   keyword: '',
 *   category: null,
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

  const handleCategoryChange = React.useCallback(
    (category: string | null) => {
      onSearchChange({ ...searchState, category });
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
      category: null,
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
          {/* Category Filter */}
          <CategoryFilter value={searchState.category} onChange={handleCategoryChange} />

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
