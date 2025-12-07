/**
 * ArticleSearch Component
 *
 * Search and filter panel for articles with keyword search,
 * source filter, and date range picker.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search/SearchInput';
import { SourceFilter } from '@/components/search/SourceFilter';
import { DateRangePicker } from '@/components/search/DateRangePicker';
import { cn } from '@/lib/utils';
import type { ArticleSearchParams } from '@/lib/api/endpoints/articles';

export interface ArticleSearchState {
  keyword: string;
  sourceId: number | null;
  fromDate: string | null;
  toDate: string | null;
}

export interface ArticleSearchProps {
  /** Current search state */
  searchState: ArticleSearchState;
  /** Callback when search state changes */
  onSearchChange: (state: ArticleSearchState) => void;
  /** Whether search is in progress */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Convert ArticleSearchState to ArticleSearchParams
 */
export function toSearchParams(state: ArticleSearchState): ArticleSearchParams {
  return {
    keyword: state.keyword || undefined,
    source_id: state.sourceId ?? undefined,
    from: state.fromDate ?? undefined,
    to: state.toDate ?? undefined,
  };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(state: ArticleSearchState): boolean {
  return !!(state.keyword || state.sourceId || state.fromDate || state.toDate);
}

/**
 * ArticleSearch component
 *
 * @example
 * ```tsx
 * const [searchState, setSearchState] = useState<ArticleSearchState>({
 *   keyword: '',
 *   sourceId: null,
 *   fromDate: null,
 *   toDate: null,
 * });
 *
 * <ArticleSearch
 *   searchState={searchState}
 *   onSearchChange={setSearchState}
 *   isLoading={isSearching}
 * />
 * ```
 */
export function ArticleSearch({
  searchState,
  onSearchChange,
  isLoading = false,
  className,
}: ArticleSearchProps) {
  const handleKeywordChange = React.useCallback(
    (keyword: string) => {
      onSearchChange({ ...searchState, keyword });
    },
    [searchState, onSearchChange]
  );

  const handleSourceChange = React.useCallback(
    (sourceId: number | null) => {
      onSearchChange({ ...searchState, sourceId });
    },
    [searchState, onSearchChange]
  );

  const handleDateChange = React.useCallback(
    (fromDate: string | null, toDate: string | null) => {
      onSearchChange({ ...searchState, fromDate, toDate });
    },
    [searchState, onSearchChange]
  );

  const handleClearAll = React.useCallback(() => {
    onSearchChange({
      keyword: '',
      sourceId: null,
      fromDate: null,
      toDate: null,
    });
  }, [onSearchChange]);

  const showClearButton = React.useMemo(() => hasActiveFilters(searchState), [searchState]);

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Search & Filter Articles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyword Search */}
        <SearchInput
          value={searchState.keyword}
          onChange={handleKeywordChange}
          placeholder="Search by title or summary..."
          isLoading={isLoading}
        />

        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Source Filter */}
          <SourceFilter value={searchState.sourceId} onChange={handleSourceChange} />

          {/* Date Range Picker */}
          <div className="sm:col-span-2">
            <DateRangePicker
              fromDate={searchState.fromDate}
              toDate={searchState.toDate}
              onChange={handleDateChange}
            />
          </div>
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
