# Frontend Search Design Document

## Overview

This document outlines the design for implementing multi-keyword search with filters functionality in the catchup-feed-web frontend. The feature will enable users to search articles and sources using multiple keywords with AND logic, along with various filtering options.

### Goals

1. **Multi-keyword Search**: Enable users to search articles and sources using space-separated keywords with AND logic
2. **Advanced Filtering**: Provide filtering options for sources, date ranges, source types, and active status
3. **Responsive UI**: Deliver a mobile-friendly search experience with instant visual feedback
4. **Performance**: Implement debouncing and optimistic UI updates to ensure smooth user experience
5. **Accessibility**: Ensure full keyboard navigation and screen reader support
6. **Consistency**: Follow existing codebase patterns (React Query, shadcn/ui, Next.js App Router)

### Non-Goals

- Full-text search with fuzzy matching (handled by backend)
- Search history persistence
- Saved search filters
- Advanced query syntax (OR, NOT operators)

---

## Technical Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **State Management**: React Query (TanStack Query v5)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: lucide-react

### Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                     Articles Page                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              ArticleSearch Component                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │ SearchInput │  │ FilterPanel │  │ DatePicker   │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│              useArticleSearch Hook (React Query)             │
│                          │                                   │
│                          ▼                                   │
│              searchArticles API Function                     │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              ArticlesList Component                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ ArticleCard │  │ ArticleCard │  │ ArticleCard │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Sources Page                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              SourceSearch Component                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │ SearchInput │  │TypeFilter   │  │ActiveFilter  │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│              useSourceSearch Hook (React Query)              │
│                          │                                   │
│                          ▼                                   │
│              searchSources API Function                      │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              SourcesGrid Component                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ SourceCard  │  │ SourceCard  │  │ SourceCard  │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy and Data Flow

### 1. Articles Search Flow

```
ArticlesPage (src/app/(protected)/articles/page.tsx)
  └── ArticleSearch (new: src/components/articles/ArticleSearch.tsx)
      ├── SearchInput (new: src/components/search/SearchInput.tsx)
      ├── SourceFilter (new: src/components/search/SourceFilter.tsx)
      └── DateRangePicker (new: src/components/search/DateRangePicker.tsx)
  └── ArticlesList (existing: modified)
      └── ArticleCard (existing: no changes)
      └── Pagination (existing: no changes)

Data Flow:
1. User types in SearchInput → debounced state update (300ms)
2. User selects filters → immediate state update
3. useArticleSearch hook triggers → React Query cache check
4. API call via searchArticles() → Backend GET /articles/search
5. Response cached by React Query → UI updates with results
```

### 2. Sources Search Flow

```
SourcesPage (src/app/(protected)/sources/page.tsx)
  └── SourceSearch (new: src/components/sources/SourceSearch.tsx)
      ├── SearchInput (reused: src/components/search/SearchInput.tsx)
      ├── TypeFilter (new: src/components/search/TypeFilter.tsx)
      └── ActiveFilter (new: src/components/search/ActiveFilter.tsx)
  └── SourcesGrid (existing: modified)
      └── SourceCard (existing: no changes)

Data Flow:
1. User types in SearchInput → debounced state update (300ms)
2. User selects filters → immediate state update
3. useSourceSearch hook triggers → React Query cache check
4. API call via searchSources() → Backend GET /sources/search
5. Response cached by React Query → UI updates with results
```

---

## API Client Design

### 1. Articles Search API

**File**: `src/lib/api/endpoints/articles.ts`

```typescript
/**
 * Search parameters for articles
 */
export interface ArticleSearchParams {
  keyword?: string;      // Space-separated keywords (AND logic)
  source_id?: number;    // Filter by source ID
  from?: string;         // Start date (YYYY-MM-DD)
  to?: string;           // End date (YYYY-MM-DD)
  page?: number;         // Page number (default: 1)
  limit?: number;        // Items per page (default: 10)
}

/**
 * Search articles with multi-keyword and filters
 *
 * @param params - Search parameters
 * @returns Promise resolving to articles response
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * // Search with keywords
 * const results = await searchArticles({ keyword: 'Go React' });
 *
 * // Search with filters
 * const results = await searchArticles({
 *   keyword: 'TypeScript',
 *   source_id: 1,
 *   from: '2024-01-01',
 *   to: '2024-12-31'
 * });
 * ```
 */
export async function searchArticles(
  params?: ArticleSearchParams
): Promise<ArticlesResponse> {
  const queryString = buildSearchQueryString(params);
  const endpoint = `/articles/search${queryString}`;

  const response = await apiClient.get<ArticlesResponse>(endpoint);

  // Apply same validation/normalization as getArticles()
  const validatedArticles: Article[] = [];

  for (const article of response) {
    if (!validateArticle(article)) {
      ArticleMigrationLogger.errorValidationFailed(
        (article as Article | undefined)?.id ?? 0,
        'Invalid article structure'
      );
      continue;
    }

    const normalizedSourceName = normalizeSourceName(article.source_name);
    validatedArticles.push({
      ...article,
      source_name: normalizedSourceName,
    });
  }

  return validatedArticles;
}

/**
 * Build query string for article search
 */
function buildSearchQueryString(params?: ArticleSearchParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.append('keyword', params.keyword);
  }
  if (params.source_id !== undefined) {
    searchParams.append('source_id', params.source_id.toString());
  }
  if (params.from) {
    searchParams.append('from', params.from);
  }
  if (params.to) {
    searchParams.append('to', params.to);
  }
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
```

### 2. Sources Search API

**File**: `src/lib/api/endpoints/sources.ts`

```typescript
/**
 * Search parameters for sources
 */
export interface SourceSearchParams {
  keyword?: string;      // Space-separated keywords (AND logic)
  source_type?: string;  // Filter by type (RSS/Webflow/NextJS/Remix)
  active?: boolean;      // Filter by active status
}

/**
 * Search sources with multi-keyword and filters
 *
 * @param params - Search parameters
 * @returns Promise resolving to sources response
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * // Search with keywords
 * const results = await searchSources({ keyword: 'Tech Blog' });
 *
 * // Search with filters
 * const results = await searchSources({
 *   keyword: 'JavaScript',
 *   source_type: 'RSS',
 *   active: true
 * });
 * ```
 */
export async function searchSources(
  params?: SourceSearchParams
): Promise<SourcesResponse> {
  const queryString = buildSourceSearchQueryString(params);
  const endpoint = `/sources/search${queryString}`;

  const response = await apiClient.get<SourcesResponse>(endpoint);
  return response;
}

/**
 * Build query string for source search
 */
function buildSourceSearchQueryString(params?: SourceSearchParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.keyword) {
    searchParams.append('keyword', params.keyword);
  }
  if (params.source_type) {
    searchParams.append('source_type', params.source_type);
  }
  if (params.active !== undefined) {
    searchParams.append('active', params.active.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
```

---

## React Query Hooks Design

### 1. useArticleSearch Hook

**File**: `src/hooks/useArticleSearch.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { searchArticles } from '@/lib/api/endpoints/articles';
import type { Article, ArticleSearchParams } from '@/lib/api/endpoints/articles';

/**
 * Pagination information
 */
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Article search hook return type
 */
interface UseArticleSearchReturn {
  /** Array of articles */
  articles: Article[];
  /** Pagination information */
  pagination: PaginationInfo;
  /** Whether the articles are being fetched */
  isLoading: boolean;
  /** Error from the last fetch attempt, or null */
  error: Error | null;
  /** Function to manually refetch articles */
  refetch: () => void;
}

/**
 * Custom hook for searching articles
 *
 * @param params - Search parameters (keyword, filters, pagination)
 * @returns Articles data, pagination, loading state, and refetch function
 *
 * @example
 * ```typescript
 * function ArticleSearch() {
 *   const [params, setParams] = useState<ArticleSearchParams>({
 *     keyword: 'React',
 *     source_id: 1,
 *     page: 1,
 *     limit: 10,
 *   });
 *
 *   const { articles, isLoading, error } = useArticleSearch(params);
 *
 *   return (
 *     <div>
 *       {articles.map((article) => (
 *         <ArticleCard key={article.id} article={article} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useArticleSearch(params?: ArticleSearchParams): UseArticleSearchReturn {
  // Query key includes all search params for cache isolation
  const queryKey = ['articles', 'search', params ?? {}];

  const {
    data,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await searchArticles(params);
      return response;
    },
    staleTime: 60000, // 60 seconds
    retry: 1,
    refetchOnWindowFocus: true,
    // Don't fetch if keyword is empty (but allow filter-only searches)
    enabled: true,
  });

  const refetch = () => {
    refetchQuery();
  };

  // Backend returns array directly
  const articles = Array.isArray(data) ? data : [];
  const total = articles.length;

  return {
    articles,
    pagination: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
      total,
      totalPages: Math.ceil(total / (params?.limit ?? 10)),
    },
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
```

### 2. useSourceSearch Hook

**File**: `src/hooks/useSourceSearch.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { searchSources } from '@/lib/api/endpoints/sources';
import type { Source, SourceSearchParams } from '@/lib/api/endpoints/sources';

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
 * Custom hook for searching sources
 *
 * @param params - Search parameters (keyword, filters)
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
 *   const { sources, isLoading, error } = useSourceSearch(params);
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
export function useSourceSearch(params?: SourceSearchParams): UseSourceSearchReturn {
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
```

---

## UI/UX Specifications

### 1. SearchInput Component (Reusable)

**File**: `src/components/search/SearchInput.tsx`

**Visual Design** (ASCII Wireframe):

```
┌────────────────────────────────────────────────────────┐
│  🔍  Search articles...                        [×]     │
└────────────────────────────────────────────────────────┘
     ↑                                            ↑
  Search Icon                                Clear Button
                                             (shows when text exists)

States:
- Default: Gray border, placeholder text
- Focus: Blue ring, darker border
- Loading: Spinner icon instead of search icon
- Error: Red border (if search fails)
```

**Features**:
- Debounced input (300ms delay)
- Loading indicator when searching
- Clear button (X) when text exists
- Keyboard shortcuts (Cmd+K / Ctrl+K to focus)
- Accessible with proper ARIA labels

**Props Interface**:
```typescript
interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when value changes (debounced) */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether search is in progress */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

### 2. ArticleSearch Component

**File**: `src/components/articles/ArticleSearch.tsx`

**Visual Design** (ASCII Wireframe):

```
┌──────────────────────────────────────────────────────────────────┐
│  Search & Filter Articles                                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐              │
│  │  🔍  Search by title or summary...      [×]    │              │
│  └────────────────────────────────────────────────┘              │
│                                                                   │
│  Filters:                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐    │
│  │ Source       │  │ From         │  │ To                  │    │
│  │ [All Sources]│  │ [YYYY-MM-DD] │  │ [YYYY-MM-DD]        │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
│                                                                   │
│  [Clear All Filters]                                             │
└──────────────────────────────────────────────────────────────────┘

Mobile Layout (< 768px):
┌────────────────────────────┐
│  Search & Filter           │
├────────────────────────────┤
│  🔍  Search...      [×]    │
│                            │
│  Source: [All Sources]     │
│  From: [YYYY-MM-DD]        │
│  To: [YYYY-MM-DD]          │
│                            │
│  [Clear Filters]           │
└────────────────────────────┘
```

**Features**:
- Collapsible filter panel on mobile
- Real-time search with debouncing
- Filter persistence in URL query params
- "Clear All Filters" button
- Active filter count badge

**State Management**:
```typescript
interface ArticleSearchState {
  keyword: string;
  sourceId: number | null;
  fromDate: string | null;
  toDate: string | null;
}
```

### 3. SourceSearch Component

**File**: `src/components/sources/SourceSearch.tsx`

**Visual Design** (ASCII Wireframe):

```
┌──────────────────────────────────────────────────────────────────┐
│  Search & Filter Sources                                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐              │
│  │  🔍  Search by name or URL...          [×]     │              │
│  └────────────────────────────────────────────────┘              │
│                                                                   │
│  Filters:                                                         │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │ Type         │  │ Status       │                              │
│  │ [All Types]  │  │ [All]        │                              │
│  └──────────────┘  └──────────────┘                              │
│                                                                   │
│  [Clear All Filters]                                             │
└──────────────────────────────────────────────────────────────────┘
```

**Features**:
- Similar to ArticleSearch but simpler filters
- Type filter dropdown (RSS, Webflow, NextJS, Remix)
- Status filter (All, Active, Inactive)
- Filter persistence in URL query params

### 4. DateRangePicker Component

**File**: `src/components/search/DateRangePicker.tsx`

**Visual Design** (ASCII Wireframe):

```
┌─────────────────────────────────────────────────────┐
│  Date Range                                         │
├─────────────────────────────────────────────────────┤
│  From:  [2024-01-01    ] 📅                         │
│  To:    [2024-12-31    ] 📅                         │
│                                                      │
│  Quick Ranges:                                       │
│  [Today] [Last 7 Days] [Last 30 Days] [This Year]   │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Two date inputs (from/to)
- HTML5 date input with native picker
- Quick range buttons for common selections
- Validation (to date must be >= from date)
- Clear button to reset range

**Props Interface**:
```typescript
interface DateRangePickerProps {
  /** Start date (YYYY-MM-DD) */
  fromDate: string | null;
  /** End date (YYYY-MM-DD) */
  toDate: string | null;
  /** Callback when date range changes */
  onChange: (fromDate: string | null, toDate: string | null) => void;
  /** Additional CSS classes */
  className?: string;
}
```

### 5. Filter Components

#### SourceFilter Component
**File**: `src/components/search/SourceFilter.tsx`

```
┌──────────────────────┐
│ Source: All Sources ▼│
└──────────────────────┘
         ↓ (click)
┌──────────────────────┐
│ All Sources       ✓  │
│ Tech Blog            │
│ Dev News             │
│ RSS Feed 1           │
└──────────────────────┘
```

- Dropdown with all available sources
- Fetches sources from existing useSources hook
- "All Sources" option to clear filter

#### TypeFilter Component
**File**: `src/components/search/TypeFilter.tsx`

```
┌──────────────────────┐
│ Type: All Types    ▼ │
└──────────────────────┘
         ↓ (click)
┌──────────────────────┐
│ All Types         ✓  │
│ RSS                  │
│ Webflow              │
│ NextJS               │
│ Remix                │
└──────────────────────┘
```

- Dropdown with source types
- Static options based on backend enum

#### ActiveFilter Component
**File**: `src/components/search/ActiveFilter.tsx`

```
┌──────────────────────┐
│ Status: All        ▼ │
└──────────────────────┘
         ↓ (click)
┌──────────────────────┐
│ All               ✓  │
│ Active Only          │
│ Inactive Only        │
└──────────────────────┘
```

- Simple 3-option dropdown
- Maps to boolean parameter in API

---

## State Management Approach

### URL Query Parameters

All search/filter state will be persisted in URL query parameters for:
- Shareable search URLs
- Browser back/forward navigation
- Page refresh preservation

**Articles Search URL Pattern**:
```
/articles?keyword=Go+React&source_id=1&from=2024-01-01&to=2024-12-31&page=1
```

**Sources Search URL Pattern**:
```
/sources?keyword=Tech&source_type=RSS&active=true
```

### Component State Flow

```typescript
// ArticlesPage State Flow
const searchParams = useSearchParams();

// 1. Read from URL
const [searchState, setSearchState] = useState({
  keyword: searchParams.get('keyword') || '',
  sourceId: Number(searchParams.get('source_id')) || null,
  fromDate: searchParams.get('from') || null,
  toDate: searchParams.get('to') || null,
  page: Number(searchParams.get('page')) || 1,
});

// 2. Update URL when state changes
useEffect(() => {
  const params = new URLSearchParams();
  if (searchState.keyword) params.set('keyword', searchState.keyword);
  if (searchState.sourceId) params.set('source_id', searchState.sourceId.toString());
  if (searchState.fromDate) params.set('from', searchState.fromDate);
  if (searchState.toDate) params.set('to', searchState.toDate);
  params.set('page', searchState.page.toString());

  router.push(`/articles?${params.toString()}`);
}, [searchState]);

// 3. Pass to React Query hook
const { articles, isLoading, error } = useArticleSearch(searchState);
```

### Debouncing Strategy

```typescript
// SearchInput Component
const [inputValue, setInputValue] = useState(value);
const debouncedValue = useDebounce(inputValue, 300);

useEffect(() => {
  onChange(debouncedValue);
}, [debouncedValue]);

// Custom useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
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

---

## Error Handling Strategy

### 1. API Error Handling

```typescript
// In useArticleSearch hook
const { data, isLoading, error } = useQuery({
  queryKey: ['articles', 'search', params],
  queryFn: async () => {
    try {
      return await searchArticles(params);
    } catch (error) {
      // ApiError is already thrown by apiClient
      throw error;
    }
  },
  retry: 1, // Only retry once
  onError: (error) => {
    // Log error for debugging
    console.error('Article search failed:', error);
  },
});
```

### 2. UI Error States

```typescript
// ArticlesPage
{error && (
  <div className="mb-6">
    <ErrorMessage
      error={error}
      onRetry={refetch}
      message="Failed to search articles. Please try again."
    />
  </div>
)}

// Empty results (not an error)
{!isLoading && !error && articles.length === 0 && (
  <EmptyState
    title="No articles found"
    description="Try adjusting your search keywords or filters."
    icon={<Search className="h-12 w-12" />}
  />
)}
```

### 3. Validation Errors

```typescript
// DateRangePicker validation
const validateDateRange = (from: string | null, to: string | null): string | null => {
  if (!from || !to) return null;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (toDate < fromDate) {
    return 'End date must be after start date';
  }

  return null;
};

// Display validation error
{dateError && (
  <p className="text-sm text-destructive mt-1">{dateError}</p>
)}
```

### 4. Network Error Recovery

```typescript
// Automatic retry with exponential backoff (handled by React Query)
const { data, error } = useQuery({
  queryKey: ['articles', 'search', params],
  queryFn: () => searchArticles(params),
  retry: 1,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// Manual retry button
<Button onClick={() => refetch()}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Retry Search
</Button>
```

---

## Responsive Design Considerations

### Breakpoints (Following Tailwind Defaults)

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

1. **Search Input**:
   - Full width on mobile
   - Larger touch targets (min 44px height)
   - Auto-focus disabled on mobile to prevent keyboard popup

2. **Filter Panel**:
   - Stacked vertically on mobile
   - Collapsible/expandable with accordion
   - Filter count badge in header

3. **Date Picker**:
   - Native HTML5 date input on mobile
   - Full-width inputs
   - Quick range buttons wrap on mobile

4. **Results Grid**:
   - Single column on mobile
   - 2 columns on tablet
   - 3 columns on desktop (for sources)

### Desktop Enhancements

1. **Keyboard Shortcuts**:
   - `Cmd+K` / `Ctrl+K`: Focus search input
   - `Esc`: Clear search input
   - `Enter`: Submit search (if needed)

2. **Hover States**:
   - Filter dropdowns show preview on hover
   - Clear button appears on hover

3. **Multi-column Layout**:
   - Search and filters in horizontal layout
   - Wider spacing between elements

### Responsive CSS Example

```css
/* Mobile-first approach */
.search-container {
  @apply flex flex-col gap-4;
}

.filter-panel {
  @apply flex flex-col gap-3;
}

/* Tablet and up */
@media (min-width: 768px) {
  .search-container {
    @apply flex-row items-end;
  }

  .filter-panel {
    @apply flex-row items-center;
  }
}
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

#### 1. Keyboard Navigation

- **Tab Order**: Logical flow through search input → filters → results
- **Focus Indicators**: Visible focus ring on all interactive elements
- **Keyboard Shortcuts**: Discoverable and non-conflicting

#### 2. Screen Reader Support

```typescript
// SearchInput
<div role="search" aria-label="Search articles">
  <input
    type="text"
    aria-label="Search by title or summary"
    aria-describedby="search-help"
    aria-invalid={error ? 'true' : 'false'}
  />
  {isLoading && (
    <div aria-live="polite" aria-busy="true">
      Searching...
    </div>
  )}
</div>

// Filter components
<label htmlFor="source-filter">Filter by source</label>
<select
  id="source-filter"
  aria-label="Filter articles by source"
  aria-describedby="source-filter-help"
>
  <option>All Sources</option>
  {/* ... */}
</select>

// Results
<div role="region" aria-live="polite" aria-atomic="true">
  {articles.length > 0 ? (
    <p className="sr-only">
      Found {articles.length} articles matching your search
    </p>
  ) : (
    <p className="sr-only">No articles found</p>
  )}
</div>
```

#### 3. Color Contrast

- All text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- Error states use both color and icon indicators
- Focus states use border + shadow (not just color)

#### 4. Form Labels

- All inputs have associated labels
- Placeholder text is not used as the only label
- Helper text linked via `aria-describedby`

#### 5. Error Announcements

```typescript
// Error state with live region
{error && (
  <div role="alert" aria-live="assertive">
    <ErrorMessage error={error} />
  </div>
)}
```

#### 6. Loading States

```typescript
// Loading indicator
{isLoading && (
  <div
    role="status"
    aria-live="polite"
    aria-label="Loading search results"
  >
    <LoadingSpinner />
    <span className="sr-only">Loading...</span>
  </div>
)}
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

1. **API Layer**
   - [ ] Add `searchArticles()` to `src/lib/api/endpoints/articles.ts`
   - [ ] Add `searchSources()` to `src/lib/api/endpoints/sources.ts`
   - [ ] Add type definitions for search params
   - [ ] Write unit tests for API functions

2. **React Query Hooks**
   - [ ] Create `useArticleSearch` hook in `src/hooks/useArticleSearch.ts`
   - [ ] Create `useSourceSearch` hook in `src/hooks/useSourceSearch.ts`
   - [ ] Write unit tests for hooks

3. **Utility Functions**
   - [ ] Create `useDebounce` hook in `src/hooks/useDebounce.ts`
   - [ ] Add date formatting utilities in `src/lib/utils/formatDate.ts`

### Phase 2: Reusable UI Components (Week 1-2)

1. **SearchInput Component**
   - [ ] Create `src/components/search/SearchInput.tsx`
   - [ ] Implement debouncing
   - [ ] Add loading state
   - [ ] Add clear button
   - [ ] Write unit tests

2. **Filter Components**
   - [ ] Create `src/components/search/SourceFilter.tsx`
   - [ ] Create `src/components/search/TypeFilter.tsx`
   - [ ] Create `src/components/search/ActiveFilter.tsx`
   - [ ] Create `src/components/search/DateRangePicker.tsx`
   - [ ] Write unit tests for each

### Phase 3: Feature Components (Week 2)

1. **ArticleSearch Component**
   - [ ] Create `src/components/articles/ArticleSearch.tsx`
   - [ ] Integrate SearchInput and filters
   - [ ] Implement URL state persistence
   - [ ] Add responsive layout
   - [ ] Write integration tests

2. **SourceSearch Component**
   - [ ] Create `src/components/sources/SourceSearch.tsx`
   - [ ] Integrate SearchInput and filters
   - [ ] Implement URL state persistence
   - [ ] Add responsive layout
   - [ ] Write integration tests

### Phase 4: Page Integration (Week 2-3)

1. **Articles Page**
   - [ ] Update `src/app/(protected)/articles/page.tsx`
   - [ ] Integrate ArticleSearch component
   - [ ] Handle search/filter state
   - [ ] Update empty states
   - [ ] Test E2E user flows

2. **Sources Page**
   - [ ] Update `src/app/(protected)/sources/page.tsx`
   - [ ] Integrate SourceSearch component
   - [ ] Handle search/filter state
   - [ ] Update empty states
   - [ ] Test E2E user flows

### Phase 5: Polish & Testing (Week 3)

1. **Accessibility**
   - [ ] Audit with axe DevTools
   - [ ] Test with screen reader (NVDA/VoiceOver)
   - [ ] Verify keyboard navigation
   - [ ] Fix any accessibility issues

2. **Responsive Design**
   - [ ] Test on mobile devices (iOS/Android)
   - [ ] Test on tablets
   - [ ] Test on different desktop sizes
   - [ ] Fix layout issues

3. **Performance**
   - [ ] Test with large result sets
   - [ ] Verify React Query caching works
   - [ ] Optimize re-renders
   - [ ] Add loading skeletons

4. **Documentation**
   - [ ] Update API documentation
   - [ ] Add JSDoc comments
   - [ ] Create user guide
   - [ ] Update README

---

## Testing Strategy

### Unit Tests

```typescript
// SearchInput.test.tsx
describe('SearchInput', () => {
  it('debounces input changes', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    // Should not call onChange immediately
    expect(onChange).not.toHaveBeenCalled();

    // Should call onChange after debounce delay
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    }, { timeout: 600 });
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<SearchInput value="" onChange={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    await userEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });
});

// useArticleSearch.test.ts
describe('useArticleSearch', () => {
  it('fetches articles with search params', async () => {
    const { result } = renderHook(() =>
      useArticleSearch({ keyword: 'React', page: 1, limit: 10 })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.articles).toHaveLength(10);
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    vi.mocked(searchArticles).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() =>
      useArticleSearch({ keyword: 'test' })
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

### Integration Tests

```typescript
// ArticleSearch.test.tsx
describe('ArticleSearch Integration', () => {
  it('updates results when search keyword changes', async () => {
    render(<ArticlesPage />);

    const searchInput = screen.getByPlaceholderText('Search articles...');
    await userEvent.type(searchInput, 'React');

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText(/Found.*articles/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('combines keyword and filter searches', async () => {
    render(<ArticlesPage />);

    // Enter keyword
    const searchInput = screen.getByPlaceholderText('Search articles...');
    await userEvent.type(searchInput, 'TypeScript');

    // Select source filter
    const sourceFilter = screen.getByLabelText('Filter by source');
    await userEvent.selectOptions(sourceFilter, '1');

    // Verify both params are sent to API
    await waitFor(() => {
      expect(searchArticles).toHaveBeenCalledWith({
        keyword: 'TypeScript',
        source_id: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  it('persists search state in URL', async () => {
    const router = createMockRouter();
    render(<ArticlesPage />, { router });

    const searchInput = screen.getByPlaceholderText('Search articles...');
    await userEvent.type(searchInput, 'Go');

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(
        expect.stringContaining('keyword=Go')
      );
    });
  });
});
```

### E2E Tests (Manual Testing Checklist)

- [ ] Search with single keyword returns relevant results
- [ ] Search with multiple keywords (space-separated) applies AND logic
- [ ] Clearing search input shows all articles
- [ ] Source filter works independently
- [ ] Date range filter works independently
- [ ] Combined filters work together (keyword + source + dates)
- [ ] URL updates when filters change
- [ ] Refreshing page preserves search state from URL
- [ ] Back/forward buttons work correctly
- [ ] Mobile responsive layout works
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader announces results and errors
- [ ] Error states display correctly
- [ ] Empty states display correctly
- [ ] Loading states display correctly

---

## Performance Considerations

### 1. React Query Caching

```typescript
// Cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,        // 60 seconds
      cacheTime: 300000,       // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// Cache keys are unique per search params
// This ensures different searches are cached separately
const queryKey = ['articles', 'search', {
  keyword: 'React',
  source_id: 1,
  from: '2024-01-01',
  to: '2024-12-31',
}];
```

### 2. Debouncing

- **Input debounce**: 300ms delay prevents excessive API calls while maintaining responsiveness
- **URL update debounce**: Update URL only after debounced search triggers
- **Filter changes**: No debounce (immediate API call)

### 3. Component Optimization

```typescript
// Memoize expensive computations
const filteredSources = useMemo(() => {
  return sources.filter(source => source.active);
}, [sources]);

// Memoize callbacks
const handleSearchChange = useCallback((value: string) => {
  setSearchState(prev => ({ ...prev, keyword: value, page: 1 }));
}, []);

// Memoize components
const MemoizedArticleCard = memo(ArticleCard);
```

### 4. Virtualization (Future Enhancement)

For very large result sets (100+ items), consider implementing virtual scrolling:

```typescript
// Using react-window or react-virtual
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={articles.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ArticleCard article={articles[index]} />
    </div>
  )}
</FixedSizeList>
```

### 5. Bundle Size

- All UI components use tree-shakeable imports
- lucide-react icons are imported individually
- Date picker uses native HTML5 input (no heavy library)

---

## Security Considerations

### 1. Input Sanitization

```typescript
// Sanitize search input (prevent XSS)
const sanitizeSearchInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .substring(0, 200);   // Limit length
};

// Use in SearchInput component
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const sanitized = sanitizeSearchInput(e.target.value);
  setInputValue(sanitized);
};
```

### 2. URL Parameter Validation

```typescript
// Validate URL parameters
const getSearchParamsFromUrl = (searchParams: URLSearchParams) => {
  const keyword = searchParams.get('keyword');
  const sourceId = searchParams.get('source_id');
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  return {
    keyword: keyword ? sanitizeSearchInput(keyword) : '',
    sourceId: sourceId && !isNaN(Number(sourceId)) ? Number(sourceId) : null,
    fromDate: fromDate && isValidDate(fromDate) ? fromDate : null,
    toDate: toDate && isValidDate(toDate) ? toDate : null,
  };
};

const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};
```

### 3. API Security

- All API calls require authentication (JWT token)
- Backend handles SQL injection prevention
- Backend limits query result size
- Rate limiting handled by backend

---

## Future Enhancements

### Short-term (Next 3-6 months)

1. **Search History**
   - Save recent searches in localStorage
   - Show dropdown with recent searches
   - Clear history option

2. **Saved Filters**
   - Allow users to save favorite filter combinations
   - Quick access to saved searches
   - User-defined filter names

3. **Advanced Search UI**
   - Toggle for "Advanced mode"
   - Support for OR logic
   - Exclude keywords (NOT logic)

### Long-term (6+ months)

1. **Search Suggestions**
   - Auto-complete based on article titles
   - Popular search suggestions
   - Typo correction

2. **Faceted Search**
   - Show result counts per filter option
   - Multi-select filters
   - Dynamic filter options based on results

3. **Full-text Search**
   - Search within article content (not just title/summary)
   - Highlighting of matching text
   - Relevance scoring

4. **Search Analytics**
   - Track popular searches
   - Search result click-through rates
   - Failed searches (no results)

---

## Dependencies

### New Dependencies

None! All functionality uses existing dependencies:
- ✅ React Query (already installed)
- ✅ shadcn/ui components (already installed)
- ✅ lucide-react icons (already installed)
- ✅ Next.js App Router (already installed)

### Existing Dependencies to Use

```json
{
  "@tanstack/react-query": "^5.90.11",
  "@radix-ui/react-label": "^2.1.8",
  "lucide-react": "^0.555.0",
  "next": "^15.0.0",
  "react": "^19.0.0",
  "tailwind-merge": "^3.4.0"
}
```

---

## Backwards Compatibility

### Breaking Changes

**None** - This is an additive feature.

### Migration Path

1. **Existing Articles Page**:
   - Current `getArticles()` API will remain unchanged
   - New `searchArticles()` API will be separate
   - Articles page will use search API when filters are active
   - Articles page will use list API when no filters are active

2. **Existing Sources Page**:
   - Current `getSources()` API will remain unchanged
   - New `searchSources()` API will be separate
   - Sources page will use search API when filters are active

### Deprecation Plan

No deprecations needed. Both list and search APIs will coexist.

---

## Observability

### 1. Structured Logging Strategy

**File**: `src/lib/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  feature: string;
  action: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (message: string, context: LogContext) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  },

  info: (message: string, context: LogContext) => {
    console.info(`[INFO] ${message}`, context);
    // Send to analytics in production
    if (!isDevelopment && window.analytics) {
      window.analytics.track('log_info', { message, ...context });
    }
  },

  warn: (message: string, context: LogContext) => {
    console.warn(`[WARN] ${message}`, context);
  },

  error: (message: string, error: Error, context: LogContext) => {
    console.error(`[ERROR] ${message}`, { error, ...context });
    // Send to error tracking service
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, { extra: context });
    }
  },
};

// Usage in search functions
export async function searchArticles(params?: ArticleSearchParams) {
  const startTime = performance.now();
  const context = {
    feature: 'search',
    action: 'article_search',
    timestamp: new Date().toISOString(),
    params,
  };

  logger.info('Article search initiated', context);

  try {
    const response = await apiClient.get<ArticlesResponse>(endpoint);

    logger.info('Article search completed', {
      ...context,
      action: 'article_search_success',
      resultCount: response.length,
      duration: Math.round(performance.now() - startTime),
    });

    return response;
  } catch (error) {
    logger.error('Article search failed', error as Error, {
      ...context,
      action: 'article_search_error',
      duration: Math.round(performance.now() - startTime),
    });
    throw error;
  }
}
```

### 2. Error Tracking Integration

**Error Boundary Component**:

```typescript
// src/components/search/SearchErrorBoundary.tsx
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SearchErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    Sentry.captureException(error, {
      tags: { feature: 'search' },
      extra: { componentStack: errorInfo.componentStack },
    });

    logger.error('Search component error', error, {
      feature: 'search',
      action: 'component_error',
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive rounded-lg">
          <p className="text-destructive">
            Something went wrong with the search. Please try refreshing the page.
          </p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<SearchErrorBoundary>
  <ArticleSearch />
</SearchErrorBoundary>
```

**API Error Handling with Detailed Tracking**:

```typescript
// Enhanced error handling in hooks
const handleApiError = (error: unknown, feature: string) => {
  const apiError = error as ApiError;

  // Track error with context
  Sentry.captureException(error, {
    tags: {
      feature,
      errorType: apiError.status ? 'api_error' : 'network_error',
      statusCode: apiError.status?.toString(),
    },
  });

  // Return user-friendly message based on error type
  switch (apiError.status) {
    case 400:
      return 'Invalid search parameters. Please check your input.';
    case 401:
      return 'Please login to search articles.';
    case 403:
      return 'You do not have permission to search.';
    case 429:
      return 'Too many searches. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
      return 'Server error. Our team has been notified.';
    default:
      return 'Failed to search. Please check your connection and try again.';
  }
};
```

### 3. Performance Monitoring

**Web Vitals Integration**:

```typescript
// src/lib/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: {
  name: string;
  value: number;
  id: string;
}) {
  // Send to analytics platform
  if (window.analytics) {
    window.analytics.track('web_vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      page: window.location.pathname,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric.value);
  }
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Initialize in app layout
// src/app/layout.tsx
useEffect(() => {
  initWebVitals();
}, []);
```

**Search Performance Tracking**:

```typescript
// Track search-specific performance
export function useSearchPerformance() {
  const trackSearchPerformance = useCallback((
    searchType: 'article' | 'source',
    params: Record<string, unknown>,
    resultCount: number,
    duration: number,
    cached: boolean
  ) => {
    const performanceData = {
      searchType,
      params,
      resultCount,
      duration,
      cached,
      timestamp: new Date().toISOString(),
    };

    // Log performance data
    logger.info('Search performance', {
      feature: 'search',
      action: 'performance_metric',
      ...performanceData,
    });

    // Track in analytics
    if (window.analytics) {
      window.analytics.track('search_performance', performanceData);
    }
  }, []);

  return { trackSearchPerformance };
}
```

### 4. User Analytics

**Comprehensive Analytics Events**:

```typescript
// src/lib/analytics/searchAnalytics.ts
export const searchAnalytics = {
  // Search initiated
  searchInitiated: (searchType: 'article' | 'source', keyword: string) => {
    track('search_initiated', {
      searchType,
      keyword,
      keywordLength: keyword.length,
      keywordCount: keyword.split(' ').filter(Boolean).length,
      timestamp: Date.now(),
    });
  },

  // Filter applied
  filterApplied: (filterType: string, value: string | number | boolean) => {
    track('filter_applied', {
      filterType,
      value,
      timestamp: Date.now(),
    });
  },

  // Search completed
  searchCompleted: (
    searchType: 'article' | 'source',
    resultCount: number,
    duration: number,
    fromCache: boolean
  ) => {
    track('search_completed', {
      searchType,
      resultCount,
      duration,
      fromCache,
      hasResults: resultCount > 0,
      timestamp: Date.now(),
    });
  },

  // Empty results
  emptyResults: (searchType: 'article' | 'source', params: Record<string, unknown>) => {
    track('search_empty_results', {
      searchType,
      params,
      timestamp: Date.now(),
    });
  },

  // Result clicked
  resultClicked: (
    searchType: 'article' | 'source',
    itemId: number,
    position: number
  ) => {
    track('search_result_clicked', {
      searchType,
      itemId,
      position,
      timestamp: Date.now(),
    });
  },

  // Filter cleared
  filterCleared: (filterType: string | 'all') => {
    track('filter_cleared', {
      filterType,
      timestamp: Date.now(),
    });
  },

  // Search error
  searchError: (searchType: 'article' | 'source', errorMessage: string) => {
    track('search_error', {
      searchType,
      errorMessage,
      timestamp: Date.now(),
    });
  },
};

function track(event: string, properties: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(event, properties);
  }
}
```

### 5. Debug Tools

**React Query DevTools**:

```typescript
// Enable React Query DevTools in development
// src/app/providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

**Debug Mode**:

```typescript
// src/lib/debug.ts
const DEBUG_MODE =
  process.env.NODE_ENV === 'development' ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('debug') === 'true');

export const debug = {
  log: (message: string, data?: unknown) => {
    if (DEBUG_MODE) {
      console.log(`[Search Debug] ${message}`, data);
    }
  },

  group: (label: string, fn: () => void) => {
    if (DEBUG_MODE) {
      console.group(`[Search Debug] ${label}`);
      fn();
      console.groupEnd();
    }
  },

  time: (label: string) => {
    if (DEBUG_MODE) {
      console.time(`[Search Debug] ${label}`);
    }
    return () => {
      if (DEBUG_MODE) {
        console.timeEnd(`[Search Debug] ${label}`);
      }
    };
  },
};

// Usage in components
debug.log('Search params changed', params);
const endTimer = debug.time('API request');
const response = await searchArticles(params);
endTimer();
```

### 6. Metrics to Track

1. **Usage Metrics**
   - Number of searches per day
   - Most popular search keywords
   - Most used filters
   - Filter combination patterns
   - Average search response time

2. **Performance Metrics**
   - API latency (p50, p95, p99)
   - React Query cache hit rate
   - Page load time with search results
   - Time to first result
   - Component render times

3. **Error Metrics**
   - Search API error rate by type (4xx, 5xx, network)
   - Empty result rate
   - User retry rate after errors
   - Error recovery success rate

4. **User Engagement Metrics**
   - Search to result click ratio
   - Filter usage patterns
   - Search abandonment rate
   - Time spent on search results

### 7. Alerting Rules

```yaml
# Monitoring alerting configuration
alerts:
  - name: High Search Error Rate
    condition: error_rate > 5%
    window: 5 minutes
    severity: critical
    notify: [slack-channel, pagerduty]

  - name: Slow Search Response
    condition: p95_latency > 3000ms
    window: 10 minutes
    severity: warning
    notify: [slack-channel]

  - name: High Empty Results Rate
    condition: empty_results_rate > 30%
    window: 15 minutes
    severity: warning
    notify: [slack-channel]

  - name: Search API Unavailable
    condition: success_rate < 50%
    window: 2 minutes
    severity: critical
    notify: [slack-channel, pagerduty]
```

---

## Conclusion

This design document provides a comprehensive blueprint for implementing multi-keyword search with filters in the catchup-feed-web frontend. The design prioritizes:

- **User Experience**: Intuitive search interface with real-time feedback
- **Performance**: Debouncing, caching, and optimistic updates
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Maintainability**: Follows existing codebase patterns
- **Extensibility**: Easy to add new filters or search features

### Next Steps

1. Review and approval from team
2. Backend API implementation (if not already done)
3. Frontend implementation following the phase plan
4. Testing and QA
5. Deployment and monitoring

### Success Criteria

- [ ] Users can search articles with multiple keywords
- [ ] Users can filter articles by source and date range
- [ ] Users can search sources with multiple keywords
- [ ] Users can filter sources by type and status
- [ ] Search results load in < 2 seconds
- [ ] Mobile experience is smooth and intuitive
- [ ] All accessibility requirements are met
- [ ] Zero critical bugs in production
