# Frontend Search Implementation - Task Plan

## Overview

This document provides a detailed task breakdown for implementing the multi-keyword search with filters feature in the catchup-feed-web frontend. Tasks are organized by category and include dependencies, acceptance criteria, and complexity estimates.

**Reference Documents:**
- Design Document: `docs/designs/frontend-search.md`
- Original Requirements: `/Users/yujitsuchiya/front-search.md`

**Assumptions:**
- Backend API endpoints (`/articles/search` and `/sources/search`) will be implemented separately
- All existing dependencies are available (React Query, shadcn/ui components, lucide-react)
- No new npm packages needed

---

## Task Categories

1. [API Layer Tasks](#1-api-layer-tasks)
2. [Utility Hook Tasks](#2-utility-hook-tasks)
3. [React Query Hook Tasks](#3-react-query-hook-tasks)
4. [UI Component Tasks - Base](#4-ui-component-tasks---base)
5. [UI Component Tasks - Search Filters](#5-ui-component-tasks---search-filters)
6. [Feature Component Tasks](#6-feature-component-tasks)
7. [Page Integration Tasks](#7-page-integration-tasks)
8. [Type Definition Tasks](#8-type-definition-tasks)
9. [Testing Tasks](#9-testing-tasks)
10. [Documentation Tasks](#10-documentation-tasks)

---

## 1. API Layer Tasks

### T-001: Add Article Search API Function

**Description:** Implement `searchArticles()` function in the articles API endpoint file to support multi-keyword search with filters.

**Dependencies:** None

**Files to Create/Modify:**
- `src/lib/api/endpoints/articles.ts` (modify)

**Implementation Details:**
```typescript
// Add new interface
export interface ArticleSearchParams {
  keyword?: string;
  source_id?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// Add new function
export async function searchArticles(params?: ArticleSearchParams): Promise<ArticlesResponse>

// Add helper function
function buildSearchQueryString(params?: ArticleSearchParams): string
```

**Key Requirements:**
- Follow existing `getArticles()` pattern exactly
- Reuse `validateArticle()` and `normalizeSourceName()` utilities
- Apply same validation/normalization logic as `getArticles()`
- Use `ArticleMigrationLogger` for debugging
- Return `ArticlesResponse` type (Article[])
- Build query string with URLSearchParams
- Handle optional parameters correctly

**Acceptance Criteria:**
- [ ] `searchArticles()` function accepts ArticleSearchParams
- [ ] Query string is built correctly with all parameters
- [ ] API endpoint is `/articles/search?...`
- [ ] Response validation matches `getArticles()` pattern
- [ ] Source names are normalized
- [ ] Invalid articles are filtered out (not thrown)
- [ ] Function is exported along with types

**Estimated Complexity:** Medium

---

### T-002: Add Source Search API Function

**Description:** Implement `searchSources()` function in the sources API endpoint file to support multi-keyword search with filters.

**Dependencies:** None

**Files to Create/Modify:**
- `src/lib/api/endpoints/sources.ts` (modify)

**Implementation Details:**
```typescript
// Add new interface
export interface SourceSearchParams {
  keyword?: string;
  source_type?: string;
  active?: boolean;
}

// Add new function
export async function searchSources(params?: SourceSearchParams): Promise<SourcesResponse>

// Add helper function
function buildSourceSearchQueryString(params?: SourceSearchParams): string
```

**Key Requirements:**
- Follow existing `getSources()` pattern exactly
- Return `SourcesResponse` type (Source[])
- Build query string with URLSearchParams
- Handle optional parameters correctly
- No additional validation needed (sources are simpler than articles)

**Acceptance Criteria:**
- [ ] `searchSources()` function accepts SourceSearchParams
- [ ] Query string is built correctly with all parameters
- [ ] API endpoint is `/sources/search?...`
- [ ] Response type is SourcesResponse (Source[])
- [ ] Function is exported along with types

**Estimated Complexity:** Low

---

## 2. Utility Hook Tasks

### T-003: Create useDebounce Hook

**Description:** Create a reusable debounce hook to delay search input updates by 300ms.

**Dependencies:** None

**Files to Create/Modify:**
- `src/hooks/useDebounce.ts` (create)

**Implementation Details:**
```typescript
/**
 * useDebounce Hook
 *
 * Debounces a value by the specified delay.
 * Useful for search inputs to avoid excessive API calls.
 */

'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Key Requirements:**
- Generic type support
- Cleanup timeout on unmount
- Update when value or delay changes
- Follow existing hook patterns ('use client' directive)

**Acceptance Criteria:**
- [ ] Hook is generic (accepts any type)
- [ ] Debounces value by specified delay
- [ ] Cleans up timeout on unmount
- [ ] Includes JSDoc documentation
- [ ] Follows existing hook patterns

**Estimated Complexity:** Low

---

## 3. React Query Hook Tasks

### T-004: Create useArticleSearch Hook

**Description:** Create a React Query hook for article search that integrates with the search API.

**Dependencies:** T-001 (searchArticles function)

**Files to Create/Modify:**
- `src/hooks/useArticleSearch.ts` (create)

**Implementation Details:**
```typescript
/**
 * useArticleSearch Hook
 *
 * Custom React hook for searching articles with filters.
 * Uses React Query for cache management with 60s stale time.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { searchArticles } from '@/lib/api/endpoints/articles';
import type { Article, ArticleSearchParams } from '@/lib/api/endpoints/articles';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseArticleSearchReturn {
  articles: Article[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useArticleSearch(params?: ArticleSearchParams): UseArticleSearchReturn
```

**Key Requirements:**
- Follow exact pattern from `useArticles` hook
- Query key: `['articles', 'search', params ?? {}]`
- Same React Query config (60s staleTime, retry: 1, refetchOnWindowFocus: true)
- Calculate pagination from array length (backend returns array directly)
- Return same interface structure as `useArticles`

**Acceptance Criteria:**
- [ ] Hook accepts ArticleSearchParams
- [ ] Query key includes all params for cache isolation
- [ ] React Query config matches existing patterns
- [ ] Returns articles array and pagination info
- [ ] Includes isLoading, error, and refetch
- [ ] Handles empty params gracefully
- [ ] Includes JSDoc documentation with examples

**Estimated Complexity:** Medium

---

### T-005: Create useSourceSearch Hook

**Description:** Create a React Query hook for source search that integrates with the search API.

**Dependencies:** T-002 (searchSources function)

**Files to Create/Modify:**
- `src/hooks/useSourceSearch.ts` (create)

**Implementation Details:**
```typescript
/**
 * useSourceSearch Hook
 *
 * Custom React hook for searching sources with filters.
 * Uses React Query for cache management with 60s stale time.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { searchSources } from '@/lib/api/endpoints/sources';
import type { Source, SourceSearchParams } from '@/lib/api/endpoints/sources';

interface UseSourceSearchReturn {
  sources: Source[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSourceSearch(params?: SourceSearchParams): UseSourceSearchReturn
```

**Key Requirements:**
- Follow exact pattern from `useSources` hook
- Query key: `['sources', 'search', params ?? {}]`
- Same React Query config (60s staleTime, retry: 1, refetchOnWindowFocus: true)
- No pagination needed for sources
- Return same interface structure as `useSources`

**Acceptance Criteria:**
- [ ] Hook accepts SourceSearchParams
- [ ] Query key includes all params for cache isolation
- [ ] React Query config matches existing patterns
- [ ] Returns sources array
- [ ] Includes isLoading, error, and refetch
- [ ] Handles empty params gracefully
- [ ] Includes JSDoc documentation with examples

**Estimated Complexity:** Low

---

## 4. UI Component Tasks - Base

### T-006: Create SearchInput Component

**Description:** Create a reusable search input component with debouncing, clear button, and loading state.

**Dependencies:** T-003 (useDebounce hook)

**Files to Create/Modify:**
- `src/components/search/SearchInput.tsx` (create)

**Implementation Details:**
```typescript
/**
 * SearchInput Component
 *
 * Reusable search input with debouncing and clear functionality.
 * Used by both ArticleSearch and SourceSearch components.
 */

'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchInput({ ... }: SearchInputProps): React.ReactElement
```

**Key Requirements:**
- Use existing `Input` UI component
- Debounce input with 300ms delay
- Show Search icon (lucide-react)
- Show Loader2 icon when isLoading is true
- Show clear button (X) when value is not empty
- Proper ARIA labels for accessibility
- Follow existing component patterns

**UI Features:**
- Search icon on left side
- Clear button (X) on right side (only when text exists)
- Loading spinner replaces search icon when loading
- Focus ring on input
- Responsive styling

**Acceptance Criteria:**
- [ ] Input is debounced by 300ms
- [ ] Shows search icon by default
- [ ] Shows loading spinner when isLoading=true
- [ ] Shows clear button when value is not empty
- [ ] Clear button empties the input
- [ ] Includes proper ARIA labels
- [ ] Follows existing UI component patterns
- [ ] Includes JSDoc documentation

**Estimated Complexity:** Medium

---

### T-007: Create DateRangePicker Component

**Description:** Create a date range picker component for filtering articles by publication date.

**Dependencies:** None

**Files to Create/Modify:**
- `src/components/search/DateRangePicker.tsx` (create)

**Implementation Details:**
```typescript
/**
 * DateRangePicker Component
 *
 * Date range selector with quick presets.
 * Uses HTML5 date inputs for native picker support.
 */

'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  fromDate: string | null;
  toDate: string | null;
  onChange: (fromDate: string | null, toDate: string | null) => void;
  className?: string;
}

export function DateRangePicker({ ... }: DateRangePickerProps): React.ReactElement
```

**Key Requirements:**
- Use HTML5 date input (type="date")
- From date and To date inputs
- Quick preset buttons: Today, Last 7 Days, Last 30 Days, This Year
- Validation: toDate must be >= fromDate
- Clear button to reset both dates
- Use existing Label and Input components
- Follow existing component patterns

**UI Features:**
- Two date inputs side by side
- Quick preset buttons below inputs
- Clear button to reset
- Calendar icon for visual cue
- Validation error message display

**Acceptance Criteria:**
- [ ] Two date inputs (from and to)
- [ ] Quick preset buttons work correctly
- [ ] Validation prevents invalid date ranges
- [ ] Clear button resets both dates
- [ ] Uses HTML5 date input (native picker)
- [ ] Includes proper labels
- [ ] Shows validation errors
- [ ] Includes JSDoc documentation

**Estimated Complexity:** Medium

---

## 5. UI Component Tasks - Search Filters

### T-008: Create SourceFilter Component

**Description:** Create a dropdown component to filter articles by source.

**Dependencies:** None (but will use data from useSources hook at runtime)

**Files to Create/Modify:**
- `src/components/search/SourceFilter.tsx` (create)

**Implementation Details:**
```typescript
/**
 * SourceFilter Component
 *
 * Dropdown to filter articles by source.
 * Fetches available sources and provides selection.
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { useSources } from '@/hooks/useSources';
import { cn } from '@/lib/utils';

interface SourceFilterProps {
  value: number | null;
  onChange: (sourceId: number | null) => void;
  className?: string;
}

export function SourceFilter({ ... }: SourceFilterProps): React.ReactElement
```

**Key Requirements:**
- Use native HTML `<select>` element (no shadcn select needed)
- Fetch sources using `useSources` hook
- "All Sources" option (value = null)
- Display source names in dropdown
- Use existing Label component
- Follow existing component patterns

**UI Features:**
- Label: "Source"
- Dropdown with all sources
- "All Sources" as first option
- Loading state while fetching sources
- Error handling for fetch failures

**Acceptance Criteria:**
- [ ] Fetches sources using useSources hook
- [ ] Displays "All Sources" option (null value)
- [ ] Lists all available sources
- [ ] onChange receives source ID or null
- [ ] Shows loading state
- [ ] Handles fetch errors gracefully
- [ ] Includes proper label
- [ ] Includes JSDoc documentation

**Estimated Complexity:** Low

---

### T-009: Create TypeFilter Component

**Description:** Create a dropdown component to filter sources by type.

**Dependencies:** None

**Files to Create/Modify:**
- `src/components/search/TypeFilter.tsx` (create)

**Implementation Details:**
```typescript
/**
 * TypeFilter Component
 *
 * Dropdown to filter sources by type (RSS, Webflow, NextJS, Remix).
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TypeFilterProps {
  value: string | null;
  onChange: (type: string | null) => void;
  className?: string;
}

export function TypeFilter({ ... }: TypeFilterProps): React.ReactElement
```

**Key Requirements:**
- Use native HTML `<select>` element
- Static options: All Types, RSS, Webflow, NextJS, Remix
- "All Types" option (value = null)
- Use existing Label component
- Follow existing component patterns

**UI Features:**
- Label: "Type"
- Dropdown with source types
- "All Types" as first option

**Acceptance Criteria:**
- [ ] Displays "All Types" option (null value)
- [ ] Lists all source types (RSS, Webflow, NextJS, Remix)
- [ ] onChange receives type string or null
- [ ] Includes proper label
- [ ] Includes JSDoc documentation

**Estimated Complexity:** Low

---

### T-010: Create ActiveFilter Component

**Description:** Create a dropdown component to filter sources by active status.

**Dependencies:** None

**Files to Create/Modify:**
- `src/components/search/ActiveFilter.tsx` (create)

**Implementation Details:**
```typescript
/**
 * ActiveFilter Component
 *
 * Dropdown to filter sources by active status.
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ActiveFilterProps {
  value: boolean | null;
  onChange: (active: boolean | null) => void;
  className?: string;
}

export function ActiveFilter({ ... }: ActiveFilterProps): React.ReactElement
```

**Key Requirements:**
- Use native HTML `<select>` element
- Static options: All, Active Only, Inactive Only
- "All" option (value = null)
- Use existing Label component
- Follow existing component patterns

**UI Features:**
- Label: "Status"
- Dropdown with status options
- "All" as first option

**Acceptance Criteria:**
- [ ] Displays "All" option (null value)
- [ ] Displays "Active Only" (true) and "Inactive Only" (false)
- [ ] onChange receives boolean or null
- [ ] Includes proper label
- [ ] Includes JSDoc documentation

**Estimated Complexity:** Low

---

## 6. Feature Component Tasks

### T-011: Create ArticleSearch Component

**Description:** Create the main article search component that combines search input and filters.

**Dependencies:**
- T-004 (useArticleSearch hook)
- T-006 (SearchInput)
- T-007 (DateRangePicker)
- T-008 (SourceFilter)

**Files to Create/Modify:**
- `src/components/articles/ArticleSearch.tsx` (create)

**Implementation Details:**
```typescript
/**
 * ArticleSearch Component
 *
 * Search and filter interface for articles.
 * Combines keyword search with source and date filters.
 */

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchInput } from '@/components/search/SearchInput';
import { SourceFilter } from '@/components/search/SourceFilter';
import { DateRangePicker } from '@/components/search/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ArticleSearchParams } from '@/lib/api/endpoints/articles';

interface ArticleSearchProps {
  onSearch: (params: ArticleSearchParams) => void;
  isLoading?: boolean;
}

export function ArticleSearch({ ... }: ArticleSearchProps): React.ReactElement
```

**Key Requirements:**
- Combine SearchInput, SourceFilter, and DateRangePicker
- Manage search state locally
- Persist state in URL query params
- Read initial state from URL on mount
- Debounced keyword search (via SearchInput)
- Immediate filter updates
- "Clear All Filters" button
- Call onSearch callback when params change
- Responsive layout (stacked on mobile, horizontal on desktop)

**State Management:**
```typescript
interface SearchState {
  keyword: string;
  sourceId: number | null;
  fromDate: string | null;
  toDate: string | null;
}
```

**URL Sync:**
- Read from searchParams on mount
- Update URL when state changes
- Use Next.js router.push

**UI Layout:**
- Card wrapper with title
- SearchInput at top (full width)
- Filters row below (3 columns on desktop, stacked on mobile)
- Clear button below filters

**Acceptance Criteria:**
- [ ] Combines all filter components
- [ ] Manages search state locally
- [ ] Syncs state with URL query params
- [ ] Calls onSearch when params change
- [ ] Keyword search is debounced
- [ ] Filter changes are immediate
- [ ] Clear All Filters button works
- [ ] Responsive layout (mobile and desktop)
- [ ] Includes JSDoc documentation

**Estimated Complexity:** High

---

### T-012: Create SourceSearch Component

**Description:** Create the main source search component that combines search input and filters.

**Dependencies:**
- T-005 (useSourceSearch hook)
- T-006 (SearchInput)
- T-009 (TypeFilter)
- T-010 (ActiveFilter)

**Files to Create/Modify:**
- `src/components/sources/SourceSearch.tsx` (create)

**Implementation Details:**
```typescript
/**
 * SourceSearch Component
 *
 * Search and filter interface for sources.
 * Combines keyword search with type and active status filters.
 */

'use client';

import * as React from 'react';
import { SearchInput } from '@/components/search/SearchInput';
import { TypeFilter } from '@/components/search/TypeFilter';
import { ActiveFilter } from '@/components/search/ActiveFilter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SourceSearchParams } from '@/lib/api/endpoints/sources';

interface SourceSearchProps {
  onSearch: (params: SourceSearchParams) => void;
  isLoading?: boolean;
}

export function SourceSearch({ ... }: SourceSearchProps): React.ReactElement
```

**Key Requirements:**
- Combine SearchInput, TypeFilter, and ActiveFilter
- Manage search state locally
- No URL sync needed (sources page is simpler)
- Debounced keyword search (via SearchInput)
- Immediate filter updates
- "Clear All Filters" button
- Call onSearch callback when params change
- Responsive layout (stacked on mobile, horizontal on desktop)

**State Management:**
```typescript
interface SearchState {
  keyword: string;
  sourceType: string | null;
  active: boolean | null;
}
```

**UI Layout:**
- Card wrapper with title
- SearchInput at top (full width)
- Filters row below (2 columns on desktop, stacked on mobile)
- Clear button below filters

**Acceptance Criteria:**
- [ ] Combines all filter components
- [ ] Manages search state locally
- [ ] Calls onSearch when params change
- [ ] Keyword search is debounced
- [ ] Filter changes are immediate
- [ ] Clear All Filters button works
- [ ] Responsive layout (mobile and desktop)
- [ ] Includes JSDoc documentation

**Estimated Complexity:** Medium

---

## 7. Page Integration Tasks

### T-013: Update Articles Page with Search Integration

**Description:** Integrate ArticleSearch component into the articles page and handle search/list mode toggling.

**Dependencies:** T-011 (ArticleSearch component), T-004 (useArticleSearch hook)

**Files to Create/Modify:**
- `src/app/(protected)/articles/page.tsx` (modify)

**Implementation Details:**

**Current State:**
- Uses `useArticles` hook with pagination
- Shows ArticleCard list
- Has Pagination component

**New State:**
- Add ArticleSearch component at top
- Toggle between `useArticles` (list mode) and `useArticleSearch` (search mode)
- Search mode is active when any filter is applied
- List mode is active when no filters are applied
- Preserve pagination in both modes

**Key Requirements:**
- Add ArticleSearch component above article list
- Determine mode based on search params from URL
- Use `useArticles` when no search params
- Use `useArticleSearch` when search params exist
- Handle loading states for both hooks
- Handle empty results differently for search vs list
- Maintain existing Pagination component
- Preserve Suspense boundary

**Mode Detection Logic:**
```typescript
const hasSearchParams = keyword || sourceId || fromDate || toDate;
const isSearchMode = hasSearchParams;
```

**Empty State Messages:**
- List mode: "No articles yet" (existing)
- Search mode: "No articles found matching your search"

**Acceptance Criteria:**
- [ ] ArticleSearch component added above article list
- [ ] Switches between list and search mode correctly
- [ ] Uses correct hook based on mode
- [ ] Handles loading states for both modes
- [ ] Shows appropriate empty state messages
- [ ] Pagination works in both modes
- [ ] URL params are synced
- [ ] Preserves Suspense boundary
- [ ] Preserves existing error handling

**Estimated Complexity:** High

---

### T-014: Update Sources Page with Search Integration

**Description:** Integrate SourceSearch component into the sources page and handle search/list mode toggling.

**Dependencies:** T-012 (SourceSearch component), T-005 (useSourceSearch hook)

**Files to Create/Modify:**
- `src/app/(protected)/sources/page.tsx` (modify)

**Implementation Details:**

**Current State:**
- Uses `useSources` hook
- Shows SourceCard grid
- No pagination
- Has admin toggle functionality

**New State:**
- Add SourceSearch component at top
- Toggle between `useSources` (list mode) and `useSourceSearch` (search mode)
- Search mode is active when any filter is applied
- List mode is active when no filters are applied
- Preserve admin toggle functionality

**Key Requirements:**
- Add SourceSearch component above source grid
- Determine mode based on search state
- Use `useSources` when no search params
- Use `useSourceSearch` when search params exist
- Handle loading states for both hooks
- Handle empty results differently for search vs list
- Maintain existing admin toggle functionality
- No URL sync needed (local state is fine)

**Mode Detection Logic:**
```typescript
const hasSearchParams = keyword || sourceType || active !== null;
const isSearchMode = hasSearchParams;
```

**Empty State Messages:**
- List mode: "No sources configured" (existing)
- Search mode: "No sources found matching your search"

**Acceptance Criteria:**
- [ ] SourceSearch component added above source grid
- [ ] Switches between list and search mode correctly
- [ ] Uses correct hook based on mode
- [ ] Handles loading states for both modes
- [ ] Shows appropriate empty state messages
- [ ] Admin toggle functionality preserved
- [ ] Local state management works
- [ ] Preserves existing error handling

**Estimated Complexity:** Medium

---

## 8. Type Definition Tasks

### T-015: Add Search Type Definitions

**Description:** Add type definitions for search parameters to the API types file.

**Dependencies:** None

**Files to Create/Modify:**
- `src/types/api.d.ts` (modify)

**Implementation Details:**

**Types to Add:**
```typescript
// Article Search Types
export interface ArticleSearchParams {
  keyword?: string;
  source_id?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// Source Search Types
export interface SourceSearchParams {
  keyword?: string;
  source_type?: string;
  active?: boolean;
}

// Update Source interface if source_type is missing
export interface Source {
  id: number;
  name: string;
  feed_url: string;
  last_crawled_at?: string | null;
  active: boolean;
  source_type?: string; // Add if not present
}
```

**Key Requirements:**
- Add ArticleSearchParams interface
- Add SourceSearchParams interface
- Verify Source interface has source_type field
- All fields should be optional (except what makes sense)
- Follow existing type conventions

**Acceptance Criteria:**
- [ ] ArticleSearchParams interface added
- [ ] SourceSearchParams interface added
- [ ] Source interface includes source_type
- [ ] All types are properly exported
- [ ] Types match design document specifications

**Estimated Complexity:** Low

---

## 9. Testing Tasks

### T-016: Unit Tests for useDebounce Hook

**Description:** Write unit tests for the useDebounce hook.

**Dependencies:** T-003 (useDebounce hook)

**Files to Create/Modify:**
- `src/hooks/useDebounce.test.ts` (create)

**Test Cases:**
- Should debounce value updates
- Should return initial value immediately
- Should update after delay
- Should cancel previous timeout on value change
- Should cleanup timeout on unmount

**Estimated Complexity:** Low

---

### T-017: Unit Tests for SearchInput Component

**Description:** Write unit tests for the SearchInput component.

**Dependencies:** T-006 (SearchInput component)

**Files to Create/Modify:**
- `src/components/search/SearchInput.test.tsx` (create)

**Test Cases:**
- Should render with placeholder
- Should debounce input changes
- Should show loading indicator when isLoading=true
- Should show clear button when value exists
- Should hide clear button when value is empty
- Should clear input when clear button is clicked
- Should call onChange after debounce delay

**Estimated Complexity:** Medium

---

### T-018: Unit Tests for useArticleSearch Hook

**Description:** Write unit tests for the useArticleSearch hook.

**Dependencies:** T-004 (useArticleSearch hook)

**Files to Create/Modify:**
- `src/hooks/useArticleSearch.test.ts` (create)

**Test Cases:**
- Should fetch articles with search params
- Should include params in query key
- Should handle empty params
- Should calculate pagination correctly
- Should handle API errors
- Should handle empty results

**Estimated Complexity:** Medium

---

### T-019: Unit Tests for useSourceSearch Hook

**Description:** Write unit tests for the useSourceSearch hook.

**Dependencies:** T-005 (useSourceSearch hook)

**Files to Create/Modify:**
- `src/hooks/useSourceSearch.test.ts` (create)

**Test Cases:**
- Should fetch sources with search params
- Should include params in query key
- Should handle empty params
- Should handle API errors
- Should handle empty results

**Estimated Complexity:** Medium

---

### T-020: Integration Tests for ArticleSearch Component

**Description:** Write integration tests for the ArticleSearch component.

**Dependencies:** T-011 (ArticleSearch component)

**Files to Create/Modify:**
- `src/components/articles/ArticleSearch.test.tsx` (create)

**Test Cases:**
- Should render all filter components
- Should call onSearch when keyword changes (debounced)
- Should call onSearch when filters change (immediate)
- Should sync state with URL params
- Should clear all filters when clear button clicked
- Should handle initial state from URL

**Estimated Complexity:** High

---

### T-021: Integration Tests for Articles Page

**Description:** Write integration tests for the updated articles page.

**Dependencies:** T-013 (Updated Articles Page)

**Files to Create/Modify:**
- `src/app/(protected)/articles/page.test.tsx` (modify or create)

**Test Cases:**
- Should render ArticleSearch component
- Should switch to search mode when params exist
- Should use list mode when no params
- Should display correct empty state for each mode
- Should handle pagination in both modes
- Should preserve URL params

**Estimated Complexity:** High

---

## 10. Documentation Tasks

### T-022: Update API Documentation

**Description:** Update API documentation to include search endpoints.

**Dependencies:** T-001, T-002

**Files to Create/Modify:**
- Add JSDoc comments to all new functions
- Update existing README if needed

**Key Requirements:**
- Document searchArticles() function
- Document searchSources() function
- Include usage examples
- Document all parameters
- Document return types

**Estimated Complexity:** Low

---

### T-023: Create Search Feature User Guide

**Description:** Create user documentation for the search feature.

**Dependencies:** All implementation tasks

**Files to Create/Modify:**
- `docs/user-guide/search-feature.md` (create, only if requested by user)

**Content:**
- How to search articles
- How to use filters
- How to combine search with filters
- Search tips and best practices
- URL sharing feature

**Note:** Only create if explicitly requested by user. This is optional.

**Estimated Complexity:** Low

---

## Task Execution Order

### Phase 1: Foundation (Week 1, Days 1-2)
1. T-015: Add Search Type Definitions
2. T-001: Add Article Search API Function
3. T-002: Add Source Search API Function
4. T-003: Create useDebounce Hook

### Phase 2: Hooks (Week 1, Days 3-4)
5. T-004: Create useArticleSearch Hook
6. T-005: Create useSourceSearch Hook

### Phase 3: Base UI Components (Week 1, Day 5 - Week 2, Day 1)
7. T-006: Create SearchInput Component
8. T-007: Create DateRangePicker Component

### Phase 4: Filter Components (Week 2, Days 2-3)
9. T-008: Create SourceFilter Component
10. T-009: Create TypeFilter Component
11. T-010: Create ActiveFilter Component

### Phase 5: Feature Components (Week 2, Days 4-5)
12. T-011: Create ArticleSearch Component
13. T-012: Create SourceSearch Component

### Phase 6: Page Integration (Week 3, Days 1-2)
14. T-013: Update Articles Page with Search Integration
15. T-014: Update Sources Page with Search Integration

### Phase 7: Testing (Week 3, Days 3-5)
16. T-016: Unit Tests for useDebounce Hook
17. T-017: Unit Tests for SearchInput Component
18. T-018: Unit Tests for useArticleSearch Hook
19. T-019: Unit Tests for useSourceSearch Hook
20. T-020: Integration Tests for ArticleSearch Component
21. T-021: Integration Tests for Articles Page

### Phase 8: Documentation (Week 3, Day 5)
22. T-022: Update API Documentation
23. T-023: Create Search Feature User Guide (optional)

---

## Implementation Notes

### Code Style Guidelines
- Follow existing TypeScript patterns in the codebase
- Use 'use client' directive for all client components
- Use existing UI components from `src/components/ui/`
- Follow existing naming conventions
- Use lucide-react for icons
- Use Tailwind CSS for styling

### Testing Guidelines
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Mock API calls in tests
- Test accessibility (ARIA labels, keyboard navigation)
- Aim for >80% code coverage on new code

### Accessibility Requirements
- All inputs must have proper labels
- Use semantic HTML
- Include ARIA attributes where needed
- Support keyboard navigation
- Ensure color contrast meets WCAG AA

### Performance Considerations
- Debounce search input (300ms)
- Use React Query caching (60s staleTime)
- Avoid unnecessary re-renders with React.memo if needed
- Keep bundle size minimal (no new dependencies)

### Error Handling
- Handle API errors gracefully
- Show user-friendly error messages
- Provide retry functionality
- Log errors for debugging
- Validate user input

---

## Success Criteria

The implementation is considered complete when:

- [ ] All 23 tasks are completed
- [ ] Users can search articles by keywords
- [ ] Users can filter articles by source and date range
- [ ] Users can search sources by keywords
- [ ] Users can filter sources by type and status
- [ ] Search results update with debouncing
- [ ] Filter changes apply immediately
- [ ] URL parameters preserve search state (articles page)
- [ ] All components are responsive (mobile and desktop)
- [ ] All accessibility requirements are met
- [ ] Unit tests pass with >80% coverage
- [ ] Integration tests verify end-to-end flows
- [ ] Documentation is complete and accurate
- [ ] No console errors or warnings
- [ ] Code follows existing patterns and conventions

---

## Risk Mitigation

### Backend API Dependency
**Risk:** Backend API may not be ready when frontend is complete.
**Mitigation:**
- Implement frontend with mock data first
- Use MSW (Mock Service Worker) for development
- Backend and frontend teams coordinate on API contract

### Type Mismatches
**Risk:** Backend response types may differ from design.
**Mitigation:**
- Validate API responses in API client layer
- Use TypeScript strict mode
- Add runtime validation if needed

### Performance Issues
**Risk:** Large result sets may cause performance problems.
**Mitigation:**
- Rely on backend pagination
- Implement virtual scrolling if needed (future enhancement)
- Monitor performance metrics

### Browser Compatibility
**Risk:** HTML5 date input may not work on older browsers.
**Mitigation:**
- Test on target browsers
- Provide fallback if needed
- Document browser requirements

---

## Post-Implementation Enhancements (Future)

These are explicitly **not** part of the current implementation but noted for future consideration:

1. **Search History** - Save recent searches in localStorage
2. **Saved Filters** - Allow users to save favorite filter combinations
3. **Search Suggestions** - Auto-complete based on article titles
4. **Advanced Search** - Support OR/NOT operators
5. **Faceted Search** - Show result counts per filter option
6. **Export Results** - Export search results to CSV/JSON

---

## Questions for Stakeholders

Before implementation, please confirm:

1. Are the backend API endpoints ready or in progress?
2. What is the expected timeline for backend completion?
3. Should we implement URL persistence for sources page as well?
4. Are there any specific analytics events to track?
5. Should we add keyboard shortcuts (e.g., Cmd+K to focus search)?
6. Are there any specific browser compatibility requirements?
7. Should we implement infinite scroll instead of pagination?

---

## Appendix: File Structure

```
src/
├── lib/
│   └── api/
│       └── endpoints/
│           ├── articles.ts (modify - T-001)
│           └── sources.ts (modify - T-002)
├── hooks/
│   ├── useDebounce.ts (create - T-003)
│   ├── useDebounce.test.ts (create - T-016)
│   ├── useArticleSearch.ts (create - T-004)
│   ├── useArticleSearch.test.ts (create - T-018)
│   ├── useSourceSearch.ts (create - T-005)
│   └── useSourceSearch.test.ts (create - T-019)
├── components/
│   ├── search/
│   │   ├── SearchInput.tsx (create - T-006)
│   │   ├── SearchInput.test.tsx (create - T-017)
│   │   ├── DateRangePicker.tsx (create - T-007)
│   │   ├── SourceFilter.tsx (create - T-008)
│   │   ├── TypeFilter.tsx (create - T-009)
│   │   └── ActiveFilter.tsx (create - T-010)
│   ├── articles/
│   │   ├── ArticleSearch.tsx (create - T-011)
│   │   └── ArticleSearch.test.tsx (create - T-020)
│   └── sources/
│       ├── SourceSearch.tsx (create - T-012)
│       └── SourceSearch.test.tsx (create - T-021)
├── app/
│   └── (protected)/
│       ├── articles/
│       │   ├── page.tsx (modify - T-013)
│       │   └── page.test.tsx (modify - T-021)
│       └── sources/
│           └── page.tsx (modify - T-014)
├── types/
│   └── api.d.ts (modify - T-015)
└── docs/
    ├── plans/
    │   └── frontend-search-tasks.md (this file)
    └── user-guide/
        └── search-feature.md (create - T-023, optional)
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-07
**Author:** EDAF Planner Agent
**Status:** Ready for Review
