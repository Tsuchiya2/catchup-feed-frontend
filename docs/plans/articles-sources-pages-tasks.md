# Task Plan: Articles and Sources Pages Implementation

## Overview

This task plan breaks down the implementation of the Articles and Sources pages feature into manageable, actionable tasks. The implementation is divided into phases, with clear dependencies and acceptance criteria for each task.

**Feature**: Articles List Page, Article Detail Page, and Sources List Page
**Design Document**: `/docs/designs/articles-sources-pages.md`
**Priority**: Must (Core Pages) + Should (Enhanced Features)

---

## Phase 1: Foundation Setup

### Task 1.1: Create Missing UI Components - Badge

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Create the Badge UI component using shadcn/ui patterns. This component will be used for displaying source names, status indicators, and metadata throughout the application.

**Deliverables**:
- `src/components/ui/badge.tsx`

**Acceptance Criteria**:
- [ ] Badge component created with multiple variants (default, secondary, success, destructive)
- [ ] Component follows shadcn/ui patterns and styling
- [ ] TypeScript types properly defined
- [ ] Component supports className prop for custom styling
- [ ] Component is accessible with proper semantic HTML

**Test Requirements**:
- [ ] Unit test for Badge component rendering
- [ ] Unit test for different variants
- [ ] Unit test for custom className

---

### Task 1.2: Create Utility Functions

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Extract and create reusable utility functions for date formatting and text truncation that are currently used in RecentArticlesList. These will be shared across all article and source components.

**Deliverables**:
- `src/lib/utils/formatDate.ts`
- `src/lib/utils/truncate.ts`

**Acceptance Criteria**:
- [ ] `formatRelativeTime()` function handles all edge cases (invalid dates, future dates, null values)
- [ ] `truncateText()` function respects word boundaries and adds ellipsis
- [ ] Both functions have proper TypeScript types
- [ ] Functions handle edge cases gracefully
- [ ] JSDoc documentation added

**Test Requirements**:
- [ ] Unit tests for formatRelativeTime with various time intervals
- [ ] Unit tests for edge cases (invalid dates, null, future dates)
- [ ] Unit tests for truncateText with various lengths
- [ ] Unit tests for word boundary respect

---

## Phase 2: Common Components

### Task 2.1: Create PageHeader Component

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Create a reusable PageHeader component that displays page title, optional description, and optional action button. This will be used across all pages for consistent styling.

**Deliverables**:
- `src/components/common/PageHeader.tsx`

**Acceptance Criteria**:
- [ ] Component renders title as h1
- [ ] Component renders optional description
- [ ] Component supports optional action button/element
- [ ] Component is responsive on all screen sizes
- [ ] Component follows design system spacing and typography
- [ ] Proper semantic HTML with accessible heading hierarchy

**Test Requirements**:
- [ ] Unit test for rendering with title only
- [ ] Unit test for rendering with title and description
- [ ] Unit test for rendering with action button
- [ ] Unit test for className prop

---

### Task 2.2: Create Pagination Component

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 1.1 (Badge)

**Description**:
Create a comprehensive Pagination component with Previous/Next buttons, page number buttons, ellipsis for large page ranges, and item count display. The component should be responsive and accessible.

**Deliverables**:
- `src/components/common/Pagination.tsx`

**Acceptance Criteria**:
- [ ] Displays Previous and Next buttons
- [ ] Displays page number buttons with current page highlighted
- [ ] Shows ellipsis (...) for large page ranges
- [ ] Displays "Showing X-Y of Z items" text
- [ ] Disables Previous on first page and Next on last page
- [ ] Responsive design (simplified on mobile)
- [ ] Keyboard accessible with arrow key navigation
- [ ] Proper ARIA labels for screen readers

**Test Requirements**:
- [ ] Unit test for rendering with multiple pages
- [ ] Unit test for first page (Previous disabled)
- [ ] Unit test for last page (Next disabled)
- [ ] Unit test for page change callbacks
- [ ] Unit test for mobile responsive behavior
- [ ] Unit test for accessibility attributes

---

### Task 2.3: Create Breadcrumb Component

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Create a Breadcrumb component for navigation hierarchy. This will be used in the Article Detail page to show the path from Articles to the current article.

**Deliverables**:
- `src/components/common/Breadcrumb.tsx`

**Acceptance Criteria**:
- [ ] Renders breadcrumb items with separators
- [ ] Last item is not clickable (current page)
- [ ] All other items are clickable links
- [ ] Proper semantic HTML with nav and aria-label
- [ ] Responsive design with truncation on mobile
- [ ] Accessible keyboard navigation

**Test Requirements**:
- [ ] Unit test for rendering multiple breadcrumb items
- [ ] Unit test for last item not being a link
- [ ] Unit test for click handlers on links
- [ ] Unit test for accessibility attributes

---

## Phase 3: Articles Components

### Task 3.1: Create ArticleCard Component

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 1.1 (Badge), Task 1.2 (Utility Functions)

**Description**:
Create the ArticleCard component that displays article information in list view. The card should show title, truncated summary, source badge, published date, and link to detail page. It should have hover effects and be fully clickable.

**Deliverables**:
- `src/components/articles/ArticleCard.tsx`

**Acceptance Criteria**:
- [ ] Displays article title (max 2 lines with ellipsis)
- [ ] Displays truncated summary (150 characters)
- [ ] Shows source badge and published date
- [ ] Links to article detail page
- [ ] Hover effects (border color, background change)
- [ ] Responsive design on all screen sizes
- [ ] Handles missing/null fields gracefully
- [ ] Accessible with proper ARIA labels

**Test Requirements**:
- [ ] Unit test for rendering article data
- [ ] Unit test for truncated summary
- [ ] Unit test for link to detail page
- [ ] Unit test for hover states (using testing-library)
- [ ] Unit test for missing data handling

---

### Task 3.2: Create ArticleHeader Component

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 1.1 (Badge), Task 1.2 (Utility Functions)

**Description**:
Create the ArticleHeader component for the article detail page. It should display the full title, metadata (source badge, published date), and a primary button to read the original article.

**Deliverables**:
- `src/components/articles/ArticleHeader.tsx`

**Acceptance Criteria**:
- [ ] Displays full article title as h1
- [ ] Shows source badge and published date
- [ ] Displays "Read Original Article" button with external link icon
- [ ] Button opens article URL in new tab with security attributes
- [ ] Responsive typography (larger on desktop, smaller on mobile)
- [ ] Handles missing metadata gracefully
- [ ] Accessible with proper semantic HTML

**Test Requirements**:
- [ ] Unit test for rendering article header
- [ ] Unit test for "Read Original Article" button
- [ ] Unit test for external link attributes (target="_blank", rel="noopener noreferrer")
- [ ] Unit test for responsive typography

---

### Task 3.3: Create AISummaryCard Component

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Create the AISummaryCard component that displays the AI-generated summary in a visually distinct card. The card should have proper formatting for paragraphs and line breaks.

**Deliverables**:
- `src/components/articles/AISummaryCard.tsx`

**Acceptance Criteria**:
- [ ] Displays summary in a Card component
- [ ] Shows "AI Summary" header with icon
- [ ] Formats text with proper line breaks and paragraphs
- [ ] Shows "Generated by AI" footer text
- [ ] Proper line height for readability (1.7)
- [ ] Handles long summaries gracefully
- [ ] Accessible with proper semantic HTML and ARIA labels

**Test Requirements**:
- [ ] Unit test for rendering summary content
- [ ] Unit test for header and footer text
- [ ] Unit test for paragraph formatting
- [ ] Unit test for accessibility

---

## Phase 4: Sources Components

### Task 4.1: Create StatusBadge Component

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: Task 1.1 (Badge)

**Description**:
Create a specialized StatusBadge component that displays "Active" or "Inactive" status with appropriate colors (green for active, gray for inactive).

**Deliverables**:
- `src/components/sources/StatusBadge.tsx`

**Acceptance Criteria**:
- [ ] Displays "Active" with green badge when active=true
- [ ] Displays "Inactive" with gray badge when active=false
- [ ] Uses Badge component with appropriate variants
- [ ] Accessible with proper ARIA labels
- [ ] TypeScript types properly defined

**Test Requirements**:
- [ ] Unit test for active status
- [ ] Unit test for inactive status
- [ ] Unit test for accessibility attributes

---

### Task 4.2: Create SourceCard Component

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 4.1 (StatusBadge), Task 1.2 (Utility Functions)

**Description**:
Create the SourceCard component that displays source information in grid view. The card should show RSS icon, name, feed URL, status badge, and last crawled time.

**Deliverables**:
- `src/components/sources/SourceCard.tsx`

**Acceptance Criteria**:
- [ ] Displays RSS icon from lucide-react
- [ ] Shows source name as heading
- [ ] Displays truncated feed URL
- [ ] Shows StatusBadge component
- [ ] Displays last crawled time in relative format
- [ ] Handles null/missing last_crawled_at gracefully
- [ ] Card design matches design system
- [ ] Responsive on all screen sizes
- [ ] Accessible with proper semantic HTML

**Test Requirements**:
- [ ] Unit test for rendering source data
- [ ] Unit test for active and inactive status
- [ ] Unit test for last crawled time formatting
- [ ] Unit test for missing last_crawled_at
- [ ] Unit test for URL truncation

---

## Phase 5: Custom Hooks

### Task 5.1: Create useArticle Hook

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: None

**Description**:
Create a custom hook for fetching a single article by ID. This hook should use TanStack Query and follow the same patterns as useArticles and useSources hooks.

**Deliverables**:
- `src/hooks/useArticle.ts`

**Acceptance Criteria**:
- [ ] Hook fetches single article by ID
- [ ] Uses TanStack Query with proper cache key
- [ ] Returns article, isLoading, error, and refetch
- [ ] Handles 404 errors separately from other errors
- [ ] Stale time set to 60 seconds
- [ ] Retry logic: 1 retry for network errors, no retry for 404
- [ ] Proper TypeScript types
- [ ] JSDoc documentation

**Test Requirements**:
- [ ] Unit test for successful article fetch
- [ ] Unit test for loading state
- [ ] Unit test for error handling
- [ ] Unit test for 404 handling
- [ ] Unit test for refetch functionality

---

### Task 5.2: Create API Endpoint for Single Article

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Create the API endpoint function for fetching a single article by ID. This will be used by the useArticle hook.

**Deliverables**:
- Updates to `src/lib/api/endpoints/articles.ts`

**Acceptance Criteria**:
- [ ] `getArticle(id: number)` function added
- [ ] Function uses apiClient for authenticated requests
- [ ] Proper error handling for 404 and other errors
- [ ] TypeScript types properly defined
- [ ] JSDoc documentation
- [ ] Follows existing API client patterns

**Test Requirements**:
- [ ] Unit test for successful API call
- [ ] Unit test for 404 error
- [ ] Unit test for network error
- [ ] Unit test for authorization header

---

## Phase 6: Page Implementation

### Task 6.1: Create Articles List Page

**Worker**: frontend-worker
**Effort**: Large
**Dependencies**: Task 3.1 (ArticleCard), Task 2.1 (PageHeader), Task 2.2 (Pagination)

**Description**:
Create the Articles List page at `/articles` that displays a paginated list of all articles. The page should handle loading, error, and empty states, and sync page number with URL query parameters.

**Deliverables**:
- `src/app/(protected)/articles/page.tsx`

**Acceptance Criteria**:
- [ ] Page displays PageHeader with title and description
- [ ] Uses useArticles hook with pagination
- [ ] Displays ArticleCard components in a list
- [ ] Shows Pagination component at bottom
- [ ] Handles loading state with 10 skeleton cards
- [ ] Handles error state with ErrorMessage and retry
- [ ] Handles empty state with EmptyState component
- [ ] Page number synced with URL query param (?page=2)
- [ ] Scrolls to top on page change
- [ ] Responsive on all screen sizes
- [ ] Accessible with proper semantic HTML

**Test Requirements**:
- [ ] Integration test for page rendering with data
- [ ] Integration test for pagination
- [ ] Integration test for loading state
- [ ] Integration test for error state
- [ ] Integration test for empty state
- [ ] Integration test for URL query param sync

---

### Task 6.2: Create Article Detail Page

**Worker**: frontend-worker
**Effort**: Large
**Dependencies**: Task 3.2 (ArticleHeader), Task 3.3 (AISummaryCard), Task 2.3 (Breadcrumb), Task 5.1 (useArticle Hook), Task 5.2 (API Endpoint)

**Description**:
Create the Article Detail page at `/articles/[id]` that displays the full article with AI summary. The page should handle loading, error, and not found states.

**Deliverables**:
- `src/app/(protected)/articles/[id]/page.tsx`

**Acceptance Criteria**:
- [ ] Page extracts article ID from route params
- [ ] Uses useArticle hook to fetch article data
- [ ] Displays Breadcrumb navigation
- [ ] Shows ArticleHeader component
- [ ] Shows AISummaryCard component
- [ ] Displays "Back to Articles" button
- [ ] Handles loading state with skeletons
- [ ] Handles 404 error with EmptyState
- [ ] Handles other errors with ErrorMessage
- [ ] "Read Original Article" opens in new tab
- [ ] "Back" button navigates to /articles
- [ ] Responsive on all screen sizes
- [ ] Max width 800px for content
- [ ] Accessible with proper semantic HTML

**Test Requirements**:
- [ ] Integration test for page rendering with article data
- [ ] Integration test for loading state
- [ ] Integration test for 404 not found state
- [ ] Integration test for error state
- [ ] Integration test for breadcrumb navigation
- [ ] Integration test for "Read Original Article" link
- [ ] Integration test for "Back to Articles" button

---

### Task 6.3: Create Sources List Page

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 4.2 (SourceCard), Task 2.1 (PageHeader)

**Description**:
Create the Sources List page at `/sources` that displays all RSS/Atom feed sources in a responsive grid. The page should be read-only with no editing capabilities.

**Deliverables**:
- `src/app/(protected)/sources/page.tsx`

**Acceptance Criteria**:
- [ ] Page displays PageHeader with title and description
- [ ] Uses useSources hook to fetch sources
- [ ] Displays SourceCard components in responsive grid
- [ ] Grid layout: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- [ ] Shows total source count at bottom
- [ ] Handles loading state with 6 skeleton cards
- [ ] Handles error state with ErrorMessage
- [ ] Handles empty state with EmptyState
- [ ] No edit/delete actions (read-only)
- [ ] Responsive on all screen sizes
- [ ] Accessible with proper semantic HTML

**Test Requirements**:
- [ ] Integration test for page rendering with sources
- [ ] Integration test for responsive grid layout
- [ ] Integration test for loading state
- [ ] Integration test for error state
- [ ] Integration test for empty state
- [ ] Integration test for source count display

---

## Phase 7: Component Testing

### Task 7.1: Write Component Tests - Common Components

**Worker**: test-worker
**Effort**: Medium
**Dependencies**: Task 2.1, 2.2, 2.3 (All Common Components)

**Description**:
Write comprehensive unit tests for all common components (PageHeader, Pagination, Breadcrumb) using Vitest and React Testing Library.

**Deliverables**:
- `src/components/common/PageHeader.test.tsx`
- `src/components/common/Pagination.test.tsx`
- `src/components/common/Breadcrumb.test.tsx`

**Acceptance Criteria**:
- [ ] All test files created with comprehensive test coverage
- [ ] Tests cover all component props and states
- [ ] Tests verify accessibility attributes
- [ ] Tests verify user interactions (clicks, keyboard)
- [ ] Tests verify responsive behavior where applicable
- [ ] All tests pass
- [ ] Code coverage >80% for all components

**Test Requirements**:
- N/A (this is the testing task)

---

### Task 7.2: Write Component Tests - Articles Components

**Worker**: test-worker
**Effort**: Medium
**Dependencies**: Task 3.1, 3.2, 3.3 (All Articles Components)

**Description**:
Write comprehensive unit tests for all articles components (ArticleCard, ArticleHeader, AISummaryCard) using Vitest and React Testing Library.

**Deliverables**:
- `src/components/articles/ArticleCard.test.tsx`
- `src/components/articles/ArticleHeader.test.tsx`
- `src/components/articles/AISummaryCard.test.tsx`

**Acceptance Criteria**:
- [ ] All test files created with comprehensive test coverage
- [ ] Tests cover all component props and states
- [ ] Tests verify data rendering
- [ ] Tests verify link behavior
- [ ] Tests verify accessibility attributes
- [ ] All tests pass
- [ ] Code coverage >80% for all components

**Test Requirements**:
- N/A (this is the testing task)

---

### Task 7.3: Write Component Tests - Sources Components

**Worker**: test-worker
**Effort**: Small
**Dependencies**: Task 4.1, 4.2 (All Sources Components)

**Description**:
Write comprehensive unit tests for all sources components (StatusBadge, SourceCard) using Vitest and React Testing Library.

**Deliverables**:
- `src/components/sources/StatusBadge.test.tsx`
- `src/components/sources/SourceCard.test.tsx`

**Acceptance Criteria**:
- [ ] All test files created with comprehensive test coverage
- [ ] Tests cover all component props and states
- [ ] Tests verify status badge rendering
- [ ] Tests verify source data rendering
- [ ] Tests verify accessibility attributes
- [ ] All tests pass
- [ ] Code coverage >80% for all components

**Test Requirements**:
- N/A (this is the testing task)

---

### Task 7.4: Write Hook Tests

**Worker**: test-worker
**Effort**: Small
**Dependencies**: Task 5.1 (useArticle Hook)

**Description**:
Write comprehensive unit tests for the useArticle hook using Vitest and React Testing Library hooks utilities.

**Deliverables**:
- `src/hooks/useArticle.test.ts`

**Acceptance Criteria**:
- [ ] Test file created with comprehensive coverage
- [ ] Tests verify successful data fetching
- [ ] Tests verify loading states
- [ ] Tests verify error handling
- [ ] Tests verify 404 handling
- [ ] Tests verify refetch functionality
- [ ] All tests pass
- [ ] Code coverage >80%

**Test Requirements**:
- N/A (this is the testing task)

---

### Task 7.5: Write Utility Tests

**Worker**: test-worker
**Effort**: Small
**Dependencies**: Task 1.2 (Utility Functions)

**Description**:
Write comprehensive unit tests for utility functions (formatDate, truncate) using Vitest.

**Deliverables**:
- `src/lib/utils/formatDate.test.ts`
- `src/lib/utils/truncate.test.ts`

**Acceptance Criteria**:
- [ ] Test files created with comprehensive coverage
- [ ] Tests cover all edge cases (null, invalid, boundary conditions)
- [ ] Tests verify correct formatting
- [ ] Tests verify error handling
- [ ] All tests pass
- [ ] Code coverage 100% for utility functions

**Test Requirements**:
- N/A (this is the testing task)

---

## Phase 8: Integration Testing

### Task 8.1: Write Integration Tests - Articles Flow

**Worker**: test-worker
**Effort**: Medium
**Dependencies**: Task 6.1, 6.2 (Articles Pages)

**Description**:
Write integration tests for the complete articles flow: viewing list, clicking article, viewing detail, navigating back. These tests should mock API responses and verify the user journey.

**Deliverables**:
- `tests/integration/articles-flow.test.tsx`

**Acceptance Criteria**:
- [ ] Test file created with complete user flow coverage
- [ ] Tests verify articles list page functionality
- [ ] Tests verify article detail page functionality
- [ ] Tests verify navigation between pages
- [ ] Tests verify pagination
- [ ] Tests verify error scenarios
- [ ] Tests use mocked API responses
- [ ] All tests pass

**Test Requirements**:
- N/A (this is the testing task)

---

### Task 8.2: Write Integration Tests - Sources Flow

**Worker**: test-worker
**Effort**: Small
**Dependencies**: Task 6.3 (Sources Page)

**Description**:
Write integration tests for the sources page. These tests should mock API responses and verify data display and error handling.

**Deliverables**:
- `tests/integration/sources-flow.test.tsx`

**Acceptance Criteria**:
- [ ] Test file created with complete functionality coverage
- [ ] Tests verify sources grid rendering
- [ ] Tests verify responsive layout
- [ ] Tests verify loading states
- [ ] Tests verify error states
- [ ] Tests use mocked API responses
- [ ] All tests pass

**Test Requirements**:
- N/A (this is the testing task)

---

## Phase 9: Enhanced Features (Should Priority)

### Task 9.1: Create ArticleFilters Component

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 6.1 (Articles List Page)

**Description**:
Create an ArticleFilters component with search input and source filter dropdown. Implement debounced search (300ms) and URL query param sync.

**Deliverables**:
- `src/components/articles/ArticleFilters.tsx`

**Acceptance Criteria**:
- [ ] Search input with debouncing (300ms delay)
- [ ] Source filter dropdown showing all sources
- [ ] Clear filters button
- [ ] Filters sync with URL query params (?search=query&source_id=5)
- [ ] Responsive layout (stacked on mobile, horizontal on desktop)
- [ ] Accessible with proper labels
- [ ] Loading state during filtering

**Test Requirements**:
- [ ] Unit test for search input debouncing
- [ ] Unit test for source filter selection
- [ ] Unit test for clear filters functionality
- [ ] Unit test for URL param sync
- [ ] Integration test with articles list page

---

### Task 9.2: Update Articles API for Filtering

**Worker**: frontend-worker
**Effort**: Small
**Dependencies**: None

**Description**:
Update the articles API endpoint and useArticles hook to support search query parameter. Backend should filter articles by title/content match.

**Deliverables**:
- Updates to `src/lib/api/endpoints/articles.ts`
- Updates to `src/hooks/useArticles.ts`
- Updates to `src/types/api.d.ts`

**Acceptance Criteria**:
- [ ] ArticlesQuery type includes search parameter
- [ ] getArticles function sends search query param
- [ ] useArticles hook supports search in query key
- [ ] Proper TypeScript types
- [ ] Documentation updated

**Test Requirements**:
- [ ] Unit test for API call with search param
- [ ] Unit test for useArticles with search
- [ ] Integration test with ArticleFilters

---

### Task 9.3: Integrate Filters into Articles List Page

**Worker**: frontend-worker
**Effort**: Medium
**Dependencies**: Task 9.1 (ArticleFilters), Task 9.2 (API Updates)

**Description**:
Integrate the ArticleFilters component into the Articles List page. Implement state management for filters, URL sync, and refetching on filter changes.

**Deliverables**:
- Updates to `src/app/(protected)/articles/page.tsx`

**Acceptance Criteria**:
- [ ] ArticleFilters component added above article list
- [ ] Filter state synced with URL query params
- [ ] Articles refetch when filters change
- [ ] Loading state shown during filter operations
- [ ] Filters persist on page refresh (from URL)
- [ ] Clear filters resets to default state

**Test Requirements**:
- [ ] Integration test for filtering by search
- [ ] Integration test for filtering by source
- [ ] Integration test for combined filters
- [ ] Integration test for URL persistence

---

## Implementation Summary

### Total Tasks: 26

**Phase 1 - Foundation Setup**: 2 tasks
**Phase 2 - Common Components**: 3 tasks
**Phase 3 - Articles Components**: 3 tasks
**Phase 4 - Sources Components**: 2 tasks
**Phase 5 - Custom Hooks**: 2 tasks
**Phase 6 - Page Implementation**: 3 tasks
**Phase 7 - Component Testing**: 5 tasks
**Phase 8 - Integration Testing**: 2 tasks
**Phase 9 - Enhanced Features**: 3 tasks (Should Priority)

### Effort Breakdown

**Small**: 10 tasks (1-2 hours each) = 10-20 hours
**Medium**: 12 tasks (3-4 hours each) = 36-48 hours
**Large**: 4 tasks (5-6 hours each) = 20-24 hours

**Total Estimated Time**: 66-92 hours (8-12 days)

### Priority Breakdown

**Must Priority (Core Features)**: Tasks 1.1 - 8.2 (23 tasks)
**Should Priority (Enhanced Features)**: Tasks 9.1 - 9.3 (3 tasks)

### Critical Path

```
Foundation (1.1, 1.2)
    ↓
Common Components (2.1, 2.2, 2.3) + UI Components (Badge)
    ↓
Articles Components (3.1, 3.2, 3.3) + Sources Components (4.1, 4.2)
    ↓
Custom Hooks & API (5.1, 5.2)
    ↓
Pages (6.1, 6.2, 6.3)
    ↓
Testing (7.1-7.5, 8.1-8.2)
    ↓
Enhanced Features (9.1-9.3) [Optional]
```

### Worker Assignment

**Frontend Worker**: Tasks 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 6.3, 9.1, 9.2, 9.3
**Test Worker**: Tasks 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2

### Success Criteria

**Must Complete**:
- ✅ All Must priority tasks (1.1 - 8.2) completed
- ✅ All pages render correctly on mobile, tablet, desktop
- ✅ All loading, error, and empty states work
- ✅ Keyboard navigation fully functional
- ✅ WCAG 2.1 AA compliance verified
- ✅ Unit tests written with >80% coverage
- ✅ Integration tests pass
- ✅ No TypeScript errors or ESLint warnings

**Should Complete** (if time permits):
- ✅ Article search and filtering functional (Tasks 9.1-9.3)
- ✅ Filters sync with URL parameters
- ✅ Debounced search working correctly

---

## Notes

1. **Parallel Execution**: Tasks within the same phase can be executed in parallel if multiple workers are available, except where explicit dependencies exist.

2. **Testing Strategy**: Testing tasks (Phase 7-8) should be executed after their dependent components are complete. Tests can be run in parallel if grouped by category.

3. **Code Review Checkpoints**:
   - After Phase 2 (Common Components)
   - After Phase 4 (All Components)
   - After Phase 6 (All Pages)
   - After Phase 8 (All Testing)

4. **API Dependencies**: This implementation assumes the backend API endpoints are already available and functional. If backend changes are needed, coordinate with backend team.

5. **Design Compliance**: All components must follow the design specifications in `/docs/designs/articles-sources-pages.md`, including:
   - Color schemes from design tokens
   - Responsive breakpoints
   - Accessibility requirements
   - Component structure and hierarchy

6. **Documentation**: Each component should include JSDoc comments with usage examples. Update this plan if significant scope changes occur.
