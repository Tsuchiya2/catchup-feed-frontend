# Design Document: Articles and Sources Pages

## 1. Feature Overview

### 1.1 Purpose

This design document outlines the implementation of core content pages for the Catchup Feed web application:

- **Articles List Page** (`/articles`) - Paginated list of all articles
- **Article Detail Page** (`/articles/[id]`) - Full article view with AI summary
- **Sources List Page** (`/sources`) - Read-only list of RSS/Atom feed sources

These pages enable users to browse aggregated content, read AI-generated summaries, and understand which sources are being tracked.

### 1.2 Requirements Addressed

**Must Priority:**
- ART-01: Article list with pagination
- ART-04: Article detail page with AI summary
- ART-05: Link to original article in detail page
- SRC-01: Source list (read-only)

**Should Priority (if time permits):**
- ART-02: Article filtering by source
- ART-03: Article search by title/content
- SRC-02: Source detail with article count and status

### 1.3 Design Principles

Following the project's UI/UX guidelines:

1. **Clean and Minimal** - Focus on content readability with generous whitespace
2. **Responsive** - Mobile-first approach with breakpoints at 768px (tablet) and 1024px (desktop)
3. **Accessible** - WCAG 2.1 AA compliance with proper ARIA labels and keyboard navigation
4. **Consistent** - Use existing shadcn/ui components and design patterns from dashboard

---

## 2. Page Designs

### 2.1 Articles List Page (`/articles`)

#### 2.1.1 Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Page Title: "Articles"                                 │ │
│  │ Subtitle: "Browse all articles from your sources"      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Filters & Search (Optional - Should Priority)          │ │
│  │ [Search Input] [Source Filter Dropdown]                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Article Card 1                                         │ │
│  │ - Title (bold, larger font)                            │ │
│  │ - Summary (2-line truncated, muted)                    │ │
│  │ - Metadata: Source badge, Published date, Read more    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Article Card 2                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ... more cards ...                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pagination                                              │ │
│  │ [Previous] [1] [2] [3] ... [Next]                      │ │
│  │ Showing 1-10 of 156 articles                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 2.1.2 Visual Design

**Desktop Layout (≥1024px):**
- Max width: 1200px (centered with container)
- Article cards: Full width with hover effects
- Pagination: Centered at bottom

**Tablet Layout (768px - 1023px):**
- Container padding: 16px
- Article cards: Full width, slightly reduced padding

**Mobile Layout (<768px):**
- Container padding: 16px
- Article cards: Full width, compact spacing
- Pagination: Simplified (Previous/Next only)

**Color Scheme:**
- Background: `bg-background`
- Cards: `bg-card` with `border` and `shadow-sm`
- Hover state: `hover:border-primary hover:bg-accent`
- Title: `text-foreground`, hover: `text-primary`
- Summary: `text-muted-foreground`
- Metadata: `text-xs text-muted-foreground`

#### 2.1.3 States

**Loading State:**
- Display 10 skeleton cards with animated pulse
- Skeleton pattern matches actual card structure

**Error State:**
- Show ErrorMessage component with retry button
- Message: "Failed to load articles. Please try again."

**Empty State:**
- Display EmptyState component with icon
- Title: "No articles found"
- Description: "Articles will appear here once they are added by the feed crawler."
- Icon: FileText from lucide-react

**Success State:**
- Display article cards
- Show pagination controls
- Display total count

---

### 2.2 Article Detail Page (`/articles/[id]`)

#### 2.2.1 Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Breadcrumb: Articles > Article Title                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Article Header                                         │ │
│  │ ┌──────────────────────────────────────────────────┐   │ │
│  │ │ Title (h1, large, bold)                          │   │ │
│  │ │                                                  │   │ │
│  │ │ Metadata Row:                                    │   │ │
│  │ │ [Source Badge] · Published: Jan 15, 2025        │   │ │
│  │ │                                                  │   │ │
│  │ │ [Read Original Article →] (Primary Button)      │   │ │
│  │ └──────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AI Summary Section                                     │ │
│  │ ┌──────────────────────────────────────────────────┐   │ │
│  │ │ 📝 AI Summary                                    │   │ │
│  │ │                                                  │   │ │
│  │ │ [Full summary text, well-formatted with proper   │   │ │
│  │ │  line breaks and paragraphs]                     │   │ │
│  │ │                                                  │   │ │
│  │ │ Generated by AI                                  │   │ │
│  │ └──────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Actions                                                │ │
│  │ [← Back to Articles]                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 2.2.2 Visual Design

**Desktop Layout (≥1024px):**
- Max width: 800px (narrower for better readability)
- Centered content
- Generous line height for summary text (1.7)

**Tablet & Mobile Layout:**
- Full width with 16px padding
- Maintain readability with proper line length

**Typography:**
- Title: `text-3xl font-bold` (mobile), `text-4xl font-bold` (desktop)
- Summary: `text-base leading-relaxed` with proper paragraph spacing
- Metadata: `text-sm text-muted-foreground`

**Components:**
- Source badge: `Badge` component with secondary variant
- Primary CTA: `Button` component with external link icon
- Back button: `Button` with ghost variant and left arrow icon

#### 2.2.3 States

**Loading State:**
- Skeleton for title (full width, 40px height)
- Skeleton for metadata row
- Skeleton for summary card (300px height)

**Error State:**
- ErrorMessage component
- Message: "Failed to load article. Please try again."
- Retry button reloads the page

**Not Found State:**
- EmptyState component
- Title: "Article not found"
- Description: "The article you're looking for doesn't exist or has been removed."
- Action button: "Back to Articles" linking to `/articles`

**Success State:**
- Display full article with all metadata
- Clickable original article link opens in new tab
- Back button navigates to previous page or `/articles`

---

### 2.3 Sources List Page (`/sources`)

#### 2.3.1 Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Page Title: "Sources"                                  │ │
│  │ Subtitle: "RSS/Atom feeds being tracked"               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Source Grid (Responsive)                               │ │
│  │                                                         │ │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │ │
│  │ │ Source Card  │ │ Source Card  │ │ Source Card  │    │ │
│  │ │              │ │              │ │              │    │ │
│  │ │ Name         │ │ Name         │ │ Name         │    │ │
│  │ │ Feed URL     │ │ Feed URL     │ │ Feed URL     │    │ │
│  │ │ Status Badge │ │ Status Badge │ │ Status Badge │    │ │
│  │ │ Last Crawled │ │ Last Crawled │ │ Last Crawled │    │ │
│  │ └──────────────┘ └──────────────┘ └──────────────┘    │ │
│  │                                                         │ │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │ │
│  │ │ Source Card  │ │ Source Card  │ │ Source Card  │    │ │
│  │ └──────────────┘ └──────────────┘ └──────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Total: 12 sources                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 2.3.2 Visual Design

**Grid Layout:**
- Desktop (≥1024px): 3 columns
- Tablet (768px - 1023px): 2 columns
- Mobile (<768px): 1 column
- Gap: 16px between cards

**Source Card Design:**
- Card component with border and shadow
- Icon: RSS icon (Rss from lucide-react)
- Name: `font-semibold text-lg`
- Feed URL: `text-xs text-muted-foreground truncate`
- Status badge: Green for active, Gray for inactive
- Last crawled: Relative time format (e.g., "2 hours ago")

**Status Indicators:**
- Active: `Badge` with success variant (green)
- Inactive: `Badge` with secondary variant (gray)

#### 2.3.3 States

**Loading State:**
- Display 6-9 skeleton cards in grid
- Match card structure with skeletons

**Error State:**
- ErrorMessage component
- Message: "Failed to load sources. Please try again."

**Empty State:**
- EmptyState component
- Title: "No sources configured"
- Description: "Feed sources will appear here once they are added by the administrator."
- Icon: Rss from lucide-react

**Success State:**
- Display source cards in responsive grid
- Show total count at bottom
- All cards are display-only (no edit/delete actions)

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
ArticlesListPage
├── PageHeader
├── ArticleFilters (Optional - Should Priority)
│   ├── SearchInput
│   └── SourceFilterSelect
├── ArticlesList
│   ├── ArticleCard (repeated)
│   │   ├── ArticleTitle
│   │   ├── ArticleSummary
│   │   └── ArticleMetadata
│   │       ├── SourceBadge
│   │       └── PublishedDate
│   └── EmptyState | LoadingState | ErrorMessage
└── Pagination
    ├── PaginationPrevious
    ├── PaginationNumbers
    └── PaginationNext

ArticleDetailPage
├── Breadcrumb
├── ArticleHeader
│   ├── ArticleTitle
│   ├── ArticleMetadata
│   │   ├── SourceBadge
│   │   └── PublishedDate
│   └── OriginalArticleButton
├── AISummaryCard
│   ├── SummaryContent
│   └── SummaryFooter
└── BackButton

SourcesListPage
├── PageHeader
├── SourcesGrid
│   ├── SourceCard (repeated)
│   │   ├── SourceIcon
│   │   ├── SourceName
│   │   ├── SourceURL
│   │   ├── StatusBadge
│   │   └── LastCrawledTime
│   └── EmptyState | LoadingState | ErrorMessage
└── SourcesCount
```

### 3.2 New Components to Create

#### 3.2.1 Articles Components (`src/components/articles/`)

**ArticleCard.tsx**
```typescript
interface ArticleCardProps {
  article: Article;
  className?: string;
}

// Displays article in list view with hover effects
// Links to article detail page
// Shows truncated summary (150 chars)
```

**ArticleHeader.tsx**
```typescript
interface ArticleHeaderProps {
  article: Article;
  source?: Source; // Optional source details
  className?: string;
}

// Displays article title, metadata, and original link button
// Used in article detail page
```

**AISummaryCard.tsx**
```typescript
interface AISummaryCardProps {
  summary: string;
  className?: string;
}

// Displays AI-generated summary in a card
// Formats text with proper line breaks
// Shows "Generated by AI" footer
```

**ArticleFilters.tsx** (Should Priority)
```typescript
interface ArticleFiltersProps {
  onSearchChange: (query: string) => void;
  onSourceChange: (sourceId: number | null) => void;
  sources: Source[];
  className?: string;
}

// Search input with debouncing
// Source dropdown filter
```

#### 3.2.2 Sources Components (`src/components/sources/`)

**SourceCard.tsx**
```typescript
interface SourceCardProps {
  source: Source;
  className?: string;
}

// Displays source information in grid view
// Shows status badge and last crawled time
// No click action (display only)
```

**StatusBadge.tsx**
```typescript
interface StatusBadgeProps {
  active: boolean;
  className?: string;
}

// Green badge for active, gray for inactive
// Text: "Active" or "Inactive"
```

#### 3.2.3 Common Components (`src/components/common/`)

**Pagination.tsx**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

// Pagination controls with Previous/Next
// Page number buttons (with ellipsis for many pages)
// Shows "Showing X-Y of Z items"
```

**PageHeader.tsx**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Reusable page header with title and optional description
// Optional action button in top-right
```

**Breadcrumb.tsx**
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Navigation breadcrumb
// Last item is not clickable (current page)
```

### 3.3 Component Reuse

**Existing Components to Reuse:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` from shadcn/ui
- `Button` with variants (default, ghost, outline)
- `Badge` for source names and status
- `Skeleton` for loading states
- `ErrorMessage` for error handling
- `EmptyState` for empty states
- `Alert` for info messages

**Shared Utilities:**
- `formatRelativeTime()` - Already exists in RecentArticlesList
- `truncateText()` - Already exists in RecentArticlesList
- `cn()` - Utility for className merging

---

## 4. Data Flow

### 4.1 Articles List Page Data Flow

```
User visits /articles
    ↓
ArticlesListPage component mounts
    ↓
useArticles hook called with query params
    ↓
TanStack Query fetches from GET /articles?page=1&limit=10
    ↓
API client adds Authorization header with JWT
    ↓
Backend returns Article[] array
    ↓
useArticles processes response and returns:
    - articles: Article[]
    - pagination: PaginationInfo
    - isLoading: boolean
    - error: Error | null
    ↓
Component renders based on state:
    - Loading: Show skeletons
    - Error: Show error message
    - Empty: Show empty state
    - Success: Show article cards + pagination
    ↓
User clicks pagination
    ↓
onPageChange updates query params
    ↓
useArticles refetches with new page
    ↓
TanStack Query uses cached data if available (60s stale time)
```

### 4.2 Article Detail Page Data Flow

```
User clicks article or visits /articles/[id]
    ↓
ArticleDetailPage component mounts
    ↓
Extract article ID from route params
    ↓
useArticle hook called with article ID
    ↓
TanStack Query fetches from GET /articles/{id}
    ↓
API client adds Authorization header with JWT
    ↓
Backend returns Article object
    ↓
useArticle returns:
    - article: Article | null
    - isLoading: boolean
    - error: Error | null
    ↓
Component renders based on state:
    - Loading: Show skeletons
    - Error (404): Show "Article not found"
    - Error (other): Show error message with retry
    - Success: Show article detail
    ↓
User clicks "Read Original Article"
    ↓
Opens article.url in new tab (target="_blank" rel="noopener noreferrer")
```

### 4.3 Sources List Page Data Flow

```
User visits /sources
    ↓
SourcesListPage component mounts
    ↓
useSources hook called
    ↓
TanStack Query fetches from GET /sources
    ↓
API client adds Authorization header with JWT
    ↓
Backend returns Source[] array
    ↓
useSources returns:
    - sources: Source[]
    - isLoading: boolean
    - error: Error | null
    ↓
Component renders based on state:
    - Loading: Show skeletons
    - Error: Show error message
    - Empty: Show empty state
    - Success: Show source cards in grid
```

### 4.4 Filtering and Search Data Flow (Should Priority)

```
User types in search input
    ↓
onChange handler with debouncing (300ms)
    ↓
Update query state (searchQuery)
    ↓
useArticles refetches with search param
    ↓
Backend filters results
    ↓
Display filtered articles

User selects source filter
    ↓
onChange handler updates query state (sourceId)
    ↓
useArticles refetches with source_id param
    ↓
Backend filters by source
    ↓
Display filtered articles
```

---

## 5. User Interactions

### 5.1 Articles List Page Interactions

| Action | Trigger | Behavior | Visual Feedback |
|--------|---------|----------|-----------------|
| View article | Click article card | Navigate to `/articles/{id}` | Card hover state (border-primary, bg-accent) |
| Change page | Click pagination button | Update URL query param, refetch | Page button highlight, loading state |
| Search articles | Type in search input | Debounced refetch with query | Input border focus, loading indicator |
| Filter by source | Select source dropdown | Refetch with source_id | Dropdown selection, loading indicator |
| Clear filters | Click clear button | Reset to default view | Remove filter chips |
| Refresh articles | Pull to refresh (mobile) | Refetch current page | Loading spinner |

### 5.2 Article Detail Page Interactions

| Action | Trigger | Behavior | Visual Feedback |
|--------|---------|----------|-----------------|
| Read original | Click "Read Original Article" button | Open article.url in new tab | Button hover state |
| Go back | Click "Back to Articles" | Navigate to previous page or `/articles` | Button hover state |
| Navigate breadcrumb | Click breadcrumb item | Navigate to clicked page | Link hover state |
| Copy link | Browser share/copy | Copy article URL to clipboard | - |

### 5.3 Sources List Page Interactions

| Action | Trigger | Behavior | Visual Feedback |
|--------|---------|----------|-----------------|
| View source details | Click source card (future) | Navigate to `/sources/{id}` | Card hover state |
| Refresh sources | Pull to refresh (mobile) | Refetch sources | Loading spinner |

### 5.4 Keyboard Navigation

All interactive elements must be keyboard accessible:

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dropdowns and modals
- **Arrow keys**: Navigate pagination buttons

Focus indicators must be clearly visible with proper outline styles.

---

## 6. Responsive Design

### 6.1 Breakpoints

```typescript
// tailwind.config.ts already defines:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### 6.2 Layout Adaptations

#### Articles List Page

**Mobile (<768px):**
- Single column layout
- Full-width article cards
- Compact padding (px-4)
- Simplified pagination (Previous/Next only)
- Search and filters stack vertically

**Tablet (768px - 1023px):**
- Single column layout with more breathing room
- Increased padding (px-6)
- Full pagination with page numbers

**Desktop (≥1024px):**
- Container max-width: 1200px
- Centered content
- Full pagination with page numbers
- Search and filters in horizontal row

#### Article Detail Page

**Mobile (<768px):**
- Single column layout
- Compact title size (text-2xl)
- Reduced padding
- Full-width buttons

**Tablet & Desktop:**
- Max-width: 800px for optimal reading
- Larger title size (text-4xl)
- Generous line height
- Centered content

#### Sources List Page

**Mobile (<768px):**
- 1 column grid
- Full-width source cards

**Tablet (768px - 1023px):**
- 2 column grid
- Equal card widths

**Desktop (≥1024px):**
- 3 column grid
- Equal card widths

### 6.3 Touch Targets

All interactive elements must meet minimum touch target size:
- Buttons: 44x44px minimum
- Links: 44px height minimum
- Clickable cards: Full card area clickable

---

## 7. Accessibility

### 7.1 Semantic HTML

```html
<!-- Articles List Page -->
<main>
  <header>
    <h1>Articles</h1>
    <p>Browse all articles from your sources</p>
  </header>

  <section aria-label="Article filters">
    <!-- Search and filter controls -->
  </section>

  <section aria-label="Articles list">
    <article> <!-- Each article card -->
      <h2>Article Title</h2>
      <!-- Card content -->
    </article>
  </section>

  <nav aria-label="Pagination">
    <!-- Pagination controls -->
  </nav>
</main>

<!-- Article Detail Page -->
<main>
  <nav aria-label="Breadcrumb">
    <!-- Breadcrumb -->
  </nav>

  <article>
    <header>
      <h1>Article Title</h1>
      <!-- Metadata -->
    </header>

    <section aria-label="AI Summary">
      <!-- Summary content -->
    </section>
  </article>
</main>

<!-- Sources List Page -->
<main>
  <header>
    <h1>Sources</h1>
    <p>RSS/Atom feeds being tracked</p>
  </header>

  <section aria-label="Sources list">
    <div role="list">
      <div role="listitem"> <!-- Each source card -->
        <!-- Card content -->
      </div>
    </div>
  </section>
</main>
```

### 7.2 ARIA Labels

**Articles List:**
- Search input: `aria-label="Search articles"`
- Source filter: `aria-label="Filter by source"`
- Article cards: `aria-label="Article: {title}"`
- Pagination: `aria-label="Pagination navigation"`

**Article Detail:**
- Original link button: `aria-label="Read original article on {source}"`
- Back button: `aria-label="Go back to articles list"`
- Breadcrumb: `aria-label="Breadcrumb navigation"`

**Sources List:**
- Source cards: `aria-label="Source: {name}"`
- Status badge: `aria-label="Status: {active/inactive}"`

### 7.3 Focus Management

- Visible focus indicators on all interactive elements
- Focus trap in modals (if implemented)
- Return focus after navigation
- Skip to main content link

### 7.4 Screen Reader Support

- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive link text (avoid "click here")
- Loading states announced with `aria-live="polite"`
- Error messages announced with `aria-live="assertive"`
- Image alt text for icons

### 7.5 Color Contrast

All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

Verify with browser DevTools or online contrast checkers.

---

## 8. Error States

### 8.1 Network Errors

**Scenario:** API request fails due to network issues

**Display:**
- ErrorMessage component
- Message: "Failed to load {resource}. Please check your connection and try again."
- Retry button that refetches data

**Example:**
```typescript
{error && (
  <ErrorMessage
    error={error}
    onRetry={() => refetch()}
  />
)}
```

### 8.2 Authentication Errors

**Scenario:** JWT token expired or invalid (401)

**Behavior:**
- Middleware catches 401 response
- Clears invalid token from localStorage
- Redirects to `/login`
- Shows message: "Your session has expired. Please log in again."

### 8.3 Not Found Errors

**Scenario:** Article or source not found (404)

**Display:**
- EmptyState component
- Title: "{Resource} not found"
- Description: "The {resource} you're looking for doesn't exist or has been removed."
- Action button: "Back to {list page}"

### 8.4 Server Errors

**Scenario:** Backend returns 500 or other server error

**Display:**
- ErrorMessage component
- Message: "Something went wrong on our end. Please try again later."
- Retry button

### 8.5 Validation Errors

**Scenario:** Search query too long or invalid filter

**Display:**
- Inline error message below input
- Red border on invalid input
- Error text: "Search query must be less than 100 characters"

---

## 9. Loading States

### 9.1 Initial Load

**Articles List:**
```typescript
{isLoading && (
  <div className="space-y-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <ArticleCardSkeleton key={i} />
    ))}
  </div>
)}
```

**Article Detail:**
```typescript
{isLoading && (
  <div className="space-y-6">
    <Skeleton className="h-10 w-3/4" /> {/* Title */}
    <Skeleton className="h-6 w-1/2" /> {/* Metadata */}
    <Skeleton className="h-64 w-full" /> {/* Summary */}
  </div>
)}
```

**Sources List:**
```typescript
{isLoading && (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <SourceCardSkeleton key={i} />
    ))}
  </div>
)}
```

### 9.2 Pagination Load

When user clicks pagination:
- Show loading spinner on clicked button
- Disable pagination buttons
- Keep existing content visible (no full skeleton)
- Scroll to top of list smoothly

### 9.3 Filter/Search Load

When user applies filter or search:
- Show loading spinner in search input or filter
- Dim existing content slightly
- Show skeleton over content area
- Clear loading state when results arrive

### 9.4 Optimistic Updates

For future features (bookmarks, etc.):
- Update UI immediately
- Revert on error
- Show success toast on confirmation

---

## 10. Empty States

### 10.1 No Articles

**When:** Articles list is empty (no articles in database)

**Display:**
```typescript
<EmptyState
  title="No articles yet"
  description="Articles will appear here once they are added by the feed crawler."
  icon={<FileText className="h-12 w-12" />}
/>
```

### 10.2 No Search Results

**When:** Search query returns no results

**Display:**
```typescript
<EmptyState
  title="No articles found"
  description={`No articles match "${searchQuery}". Try a different search term.`}
  icon={<Search className="h-12 w-12" />}
  action={
    <Button variant="outline" onClick={clearSearch}>
      Clear Search
    </Button>
  }
/>
```

### 10.3 No Sources

**When:** Sources list is empty

**Display:**
```typescript
<EmptyState
  title="No sources configured"
  description="Feed sources will appear here once they are added by the administrator."
  icon={<Rss className="h-12 w-12" />}
/>
```

---

## 11. Implementation Plan

### 11.1 Phase 1: Core Pages (Must Priority)

**Step 1: Setup Routes and Pages**
- Create `/src/app/(protected)/articles/page.tsx`
- Create `/src/app/(protected)/articles/[id]/page.tsx`
- Create `/src/app/(protected)/sources/page.tsx`
- Verify routing works with basic content

**Step 2: Create Common Components**
- `PageHeader` - Reusable page title/description
- `Pagination` - Pagination controls
- `Breadcrumb` - Navigation breadcrumb

**Step 3: Articles List Page**
- Create `ArticleCard` component
- Implement articles list page with useArticles hook
- Add loading, error, and empty states
- Implement pagination
- Test responsive behavior

**Step 4: Article Detail Page**
- Create `ArticleHeader` component
- Create `AISummaryCard` component
- Create custom `useArticle` hook for fetching single article
- Implement article detail page
- Add loading, error, and not found states
- Add breadcrumb and back button

**Step 5: Sources List Page**
- Create `SourceCard` component
- Create `StatusBadge` component
- Implement sources list page with useSources hook
- Add loading, error, and empty states
- Implement responsive grid layout

**Step 6: Testing**
- Write unit tests for all new components
- Write integration tests for page flows
- Test keyboard navigation
- Test screen reader compatibility
- Verify responsive behavior on all breakpoints

### 11.2 Phase 2: Enhanced Features (Should Priority)

**Step 7: Article Filters (ART-02, ART-03)**
- Create `ArticleFilters` component with search and source filter
- Implement debounced search functionality
- Add URL query param sync for filters
- Update useArticles hook to support search params
- Add clear filters functionality

**Step 8: Source Detail Page (SRC-02)**
- Create `/src/app/(protected)/sources/[id]/page.tsx`
- Create `useSource` hook for fetching single source
- Create `SourceDetail` component with article count
- Implement source detail page
- Add link from source card to detail page

**Step 9: Performance Optimization**
- Implement infinite scroll as alternative to pagination
- Add prefetching for adjacent pages
- Optimize images (if added later)
- Analyze and optimize bundle size

**Step 10: Polish**
- Add animations and transitions
- Improve loading states with staggered skeletons
- Add success toasts for user actions
- Final accessibility audit

### 11.3 Implementation Order

```
1. Common Components (PageHeader, Pagination, Breadcrumb)
   ↓
2. Articles Components (ArticleCard, ArticleHeader, AISummaryCard)
   ↓
3. Sources Components (SourceCard, StatusBadge)
   ↓
4. Custom Hooks (useArticle)
   ↓
5. Pages (articles/page.tsx, articles/[id]/page.tsx, sources/page.tsx)
   ↓
6. Testing (unit tests, integration tests)
   ↓
7. Enhanced Features (filters, search, source detail)
   ↓
8. Performance & Polish
```

### 11.4 Testing Strategy

**Unit Tests:**
- All components with Vitest + Testing Library
- Test props, states, and user interactions
- Test accessibility (ARIA labels, keyboard nav)

**Integration Tests:**
- Page flows with mocked API responses
- Pagination, filtering, searching
- Error handling and loading states

**E2E Tests (Future):**
- Full user journeys with Playwright
- Cross-browser testing
- Mobile device testing

### 11.5 Success Criteria

**Must Complete:**
- ✅ All Must priority requirements implemented
- ✅ Pages render correctly on mobile, tablet, desktop
- ✅ All loading, error, and empty states work
- ✅ Keyboard navigation fully functional
- ✅ WCAG 2.1 AA compliance verified
- ✅ Unit tests written with >80% coverage
- ✅ No TypeScript errors or ESLint warnings

**Should Complete (if time permits):**
- ✅ Article search and filtering functional
- ✅ Source detail page implemented
- ✅ Performance optimization completed
- ✅ Animations and polish applied

---

## 12. Technical Considerations

### 12.1 Data Fetching Strategy

**TanStack Query Configuration:**
```typescript
{
  staleTime: 60000, // 60 seconds
  retry: 1,
  refetchOnWindowFocus: true,
}
```

**Pagination Strategy:**
- Backend returns full array, frontend handles pagination
- Alternative: Update backend to support pagination with total count
- Use URL query params for page state (`?page=2`)

**Caching Strategy:**
- Article list cached by query params (page, limit, source_id, search)
- Single article cached by ID
- Sources list cached globally
- Cache invalidation on refetch

### 12.2 URL State Management

**Articles List:**
- `/articles?page=2&limit=10&source=5&search=query`
- Use Next.js router to read and update query params
- Maintain state in URL for shareability

**Article Detail:**
- `/articles/123`
- No query params needed

**Sources List:**
- `/sources`
- No pagination needed (display all)

### 12.3 Performance Optimizations

**Code Splitting:**
- Page-level code splitting automatic with Next.js App Router
- Dynamic imports for heavy components if needed

**Image Optimization:**
- Use Next.js Image component if article thumbnails added later
- Lazy load images below the fold

**Bundle Size:**
- Keep lucide-react imports specific (import { Icon } from 'lucide-react')
- Analyze bundle with `npm run build`

**Rendering Strategy:**
- Server-side rendering for initial page load (better SEO, faster FCP)
- Client-side data fetching with TanStack Query (better UX, caching)

### 12.4 TypeScript Patterns

**Component Props:**
```typescript
// Use Pick/Omit for derived types
type ArticleCardProps = Pick<Article, 'id' | 'title' | 'summary'> & {
  className?: string;
}

// Use strict typing for events
onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
```

**Hook Return Types:**
```typescript
interface UseArticleReturn {
  article: Article | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### 12.5 Error Boundaries

Implement React Error Boundary for graceful error handling:
```typescript
// src/app/error.tsx (Next.js convention)
'use client';

export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 12.6 Data Validation Strategy

**API Response Validation:**

Use Zod for runtime type validation of API responses to ensure data integrity:

```typescript
// src/lib/api/validators/article.ts
import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.number().positive(),
  source_id: z.number().positive(),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  summary: z.string().max(10000),
  published_at: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  created_at: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

export const ArticlesResponseSchema = z.array(ArticleSchema);

export const SourceSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(200),
  feed_url: z.string().url(),
  last_crawled_at: z.string().datetime().nullable().optional(),
  active: z.boolean(),
});

export const SourcesResponseSchema = z.array(SourceSchema);
```

**Validation in API Client:**

```typescript
// src/lib/api/endpoints/articles.ts
export async function getArticles(query?: ArticlesQuery): Promise<Article[]> {
  const response = await apiClient.get<unknown>(`/articles${buildQueryString(query)}`);

  // Validate response data
  const result = ArticlesResponseSchema.safeParse(response);
  if (!result.success) {
    console.error('API response validation failed:', result.error);
    throw new Error('Invalid API response format');
  }

  return result.data;
}
```

**XSS Prevention:**

For AI summaries and RSS content that may contain HTML:

```typescript
// src/lib/utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags
    return html.replace(/<[^>]*>/g, '');
  }
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}
```

### 12.7 Edge Case Handling

**Long Text Handling:**

```typescript
// CSS for long titles
.article-title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  hyphens: auto;
}

// TypeScript truncation with word boundary respect
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';

  // Find last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  return truncated.trim() + '...';
}
```

**Invalid/Missing Date Handling:**

```typescript
// src/lib/utils/formatDate.ts
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Date unavailable';
  }

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  // Check for future dates (allow 1 hour tolerance for timezone issues)
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  if (date > oneHourFromNow) {
    return 'Scheduled';
  }

  // Normal relative time formatting
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
```

**Pagination Edge Cases:**

```typescript
// src/hooks/useArticles.ts
export function useArticles(query?: ArticlesQuery): UseArticlesReturn {
  const page = Math.max(1, query?.page ?? 1); // Ensure page >= 1
  const limit = Math.min(100, Math.max(1, query?.limit ?? 10)); // Limit between 1-100

  // Prevent infinite loops on pagination
  const clampedPage = Math.min(page, Math.ceil(total / limit) || 1);

  // ...
}
```

**Empty/Null Field Handling:**

```typescript
// src/components/articles/ArticleCard.tsx
function ArticleCard({ article }: ArticleCardProps) {
  // Safe field access with fallbacks
  const title = article.title?.trim() || 'Untitled Article';
  const summary = article.summary?.trim() || 'No summary available.';
  const url = article.url || '#';

  return (
    <Card>
      <h3>{truncateText(title, 100)}</h3>
      {summary !== 'No summary available.' && (
        <p>{truncateText(summary, 150)}</p>
      )}
    </Card>
  );
}
```

### 12.8 Retry Mechanism and Network Resilience

**Enhanced TanStack Query Configuration:**

```typescript
// src/lib/api/queryConfig.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 60 seconds
      retry: (failureCount, error) => {
        // Don't retry on 401/403 (auth errors)
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403) return false;
          // Don't retry on 404 (not found)
          if (error.status === 404) return false;
          // Retry up to 3 times on 5xx errors
          if (error.status >= 500) return failureCount < 3;
        }
        // Retry network errors up to 2 times
        if (error.name === 'NetworkError') return failureCount < 2;
        return false;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff with jitter
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 1000;
        return baseDelay + jitter;
      },
      refetchOnWindowFocus: true,
    },
  },
});
```

**API Client Timeout:**

```typescript
// src/lib/api/client.ts
const API_TIMEOUT = 30000; // 30 seconds

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}
```

**Offline Detection:**

```typescript
// src/hooks/useOnlineStatus.ts
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage in component
function ArticlesPage() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <Alert variant="warning">
        <AlertTitle>You're offline</AlertTitle>
        <AlertDescription>
          Check your internet connection. Cached content may be shown.
        </AlertDescription>
      </Alert>
    );
  }

  // ...
}
```

### 12.9 Graceful Degradation

**Progressive Enhancement Strategy:**

1. **Server-Side Rendering First**: Pages render with initial data from server
2. **Client-Side Enhancement**: TanStack Query adds caching and real-time updates
3. **JavaScript Disabled Fallback**: Basic content visible without JS

```typescript
// src/app/(protected)/articles/page.tsx
// Server component for initial render
export default async function ArticlesPage() {
  // Server-side data fetching for initial render
  const initialArticles = await fetchArticlesServer();

  return (
    <Suspense fallback={<ArticlesPageSkeleton />}>
      <ArticlesPageClient initialData={initialArticles} />
    </Suspense>
  );
}
```

**Partial Failure Handling:**

```typescript
// When source info fails but articles succeed
function ArticleCard({ article, source }: ArticleCardProps) {
  return (
    <Card>
      <h3>{article.title}</h3>
      {source ? (
        <Badge>{source.name}</Badge>
      ) : (
        <Badge variant="secondary">Source #{article.source_id}</Badge>
      )}
    </Card>
  );
}
```

**Component-Level Error Boundaries:**

```typescript
// src/components/common/ComponentErrorBoundary.tsx
'use client';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

export class ComponentErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
    // Future: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Failed to load this section. The rest of the page should work normally.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ComponentErrorBoundary componentName="ArticlesList">
  <ArticlesList articles={articles} />
</ComponentErrorBoundary>
```

---

## 13. Design Decisions

### 13.1 Why Card-Based Layout?

- Provides clear visual separation between articles
- Allows for hover effects to indicate interactivity
- Scales well across different screen sizes
- Consistent with existing dashboard design

### 13.2 Why Pagination Over Infinite Scroll?

**Pros of Pagination:**
- Better performance with large datasets
- Easier to jump to specific pages
- Better for accessibility (clear navigation)
- Simpler implementation

**Cons:**
- Requires extra click to load more
- Less smooth on mobile

**Decision:** Implement pagination first, consider infinite scroll as enhancement.

### 13.3 Why Read-Only Sources Page?

**Security Concerns:**
- Source management is admin-only operation
- Prevents accidental or malicious source modifications
- Reduces attack surface

**User Experience:**
- Regular users don't need to manage sources
- Transparency: show what sources are being tracked
- Future: Admin panel for source management

### 13.4 Why Truncate Summaries in List View?

- Improves scannability of article list
- Reduces page load time and layout shift
- Encourages users to click for full details
- Consistent with common news aggregator patterns

### 13.5 Why Separate Detail Page?

- Provides dedicated space for full summary
- Reduces cognitive load on list page
- Allows for future enhancements (comments, bookmarks, related articles)
- Better for SEO and sharing

---

## 14. Future Enhancements

### 14.1 Article Features

- **Bookmarking**: Save articles for later reading
- **Reading History**: Track read/unread status
- **Related Articles**: Show similar articles based on content
- **Article Thumbnails**: Display featured images from RSS feeds
- **Export**: Download articles as PDF or markdown
- **Sharing**: Share articles via social media or email

### 14.2 Source Features

- **Source Stats**: Detailed analytics per source
- **Source Management**: Admin interface for CRUD operations
- **Custom Source Icons**: Upload custom icons for each source
- **Source Categories**: Group sources by topic

### 14.3 Search & Discovery

- **Advanced Search**: Filter by date range, source, tags
- **Saved Searches**: Save frequently used search queries
- **Search Suggestions**: Autocomplete based on article titles
- **Trending Topics**: Highlight popular topics

### 14.4 Personalization

- **Custom Feeds**: Create personalized feed views
- **Reading Preferences**: Customize article display (font size, theme)
- **Notification Preferences**: Email/push notifications for new articles
- **Reading Time Estimates**: Show estimated reading time

### 14.5 Performance

- **Progressive Web App**: Offline support, install as app
- **Background Sync**: Sync articles in background
- **Prefetching**: Prefetch next page or adjacent articles
- **Virtual Scrolling**: Handle extremely large lists efficiently

---

## 15. Appendix

### 15.1 File Structure

```
src/
├── app/
│   └── (protected)/
│       ├── articles/
│       │   ├── page.tsx              # Articles list page
│       │   └── [id]/
│       │       └── page.tsx          # Article detail page
│       └── sources/
│           └── page.tsx              # Sources list page
├── components/
│   ├── articles/
│   │   ├── ArticleCard.tsx           # Article list item
│   │   ├── ArticleCard.test.tsx
│   │   ├── ArticleHeader.tsx         # Article detail header
│   │   ├── ArticleHeader.test.tsx
│   │   ├── AISummaryCard.tsx         # AI summary display
│   │   ├── AISummaryCard.test.tsx
│   │   ├── ArticleFilters.tsx        # Search & filter (Should)
│   │   └── ArticleFilters.test.tsx
│   ├── sources/
│   │   ├── SourceCard.tsx            # Source grid item
│   │   ├── SourceCard.test.tsx
│   │   ├── StatusBadge.tsx           # Active/inactive badge
│   │   └── StatusBadge.test.tsx
│   └── common/
│       ├── Pagination.tsx            # Pagination controls
│       ├── Pagination.test.tsx
│       ├── PageHeader.tsx            # Page title/description
│       ├── PageHeader.test.tsx
│       ├── Breadcrumb.tsx            # Navigation breadcrumb
│       └── Breadcrumb.test.tsx
├── hooks/
│   ├── useArticle.ts                 # Single article fetching
│   └── useArticle.test.ts
└── lib/
    └── utils/
        ├── formatDate.ts             # Date formatting utilities
        └── truncate.ts               # Text truncation utilities
```

### 15.2 Key Dependencies

Already installed:
- `next` (^15.0.0) - Framework
- `react` (^19.0.0) - UI library
- `@tanstack/react-query` (^5.62.11) - Data fetching
- `tailwindcss` (^4.0.0) - Styling
- `lucide-react` (^0.468.0) - Icons
- `class-variance-authority` (^0.7.1) - Component variants
- `clsx` (^2.1.1) - Conditional classes

No new dependencies needed for core functionality.

### 15.3 API Endpoints Reference

| Endpoint | Method | Query Params | Response Type | Auth |
|----------|--------|--------------|---------------|------|
| `/articles` | GET | `page`, `limit`, `source_id` | `Article[]` | Required |
| `/articles/{id}` | GET | - | `Article` | Required |
| `/sources` | GET | - | `Source[]` | Required |
| `/sources/{id}` | GET | - | `Source` | Required |

### 15.4 Type Definitions

```typescript
// Already defined in src/types/api.d.ts

interface Article {
  id: number;
  source_id: number;
  title: string;
  url: string;
  summary: string;
  published_at: string;
  created_at: string;
}

interface Source {
  id: number;
  name: string;
  feed_url: string;
  last_crawled_at?: string | null;
  active: boolean;
}

interface ArticlesQuery {
  page?: number;
  limit?: number;
  source_id?: number;
}
```

### 15.5 Color Palette

Using Tailwind CSS design tokens:

**Light Mode:**
- Background: `hsl(0 0% 100%)`
- Foreground: `hsl(222.2 84% 4.9%)`
- Card: `hsl(0 0% 100%)`
- Muted: `hsl(210 40% 96.1%)`
- Border: `hsl(214.3 31.8% 91.4%)`
- Primary: `hsl(222.2 47.4% 11.2%)`

**Dark Mode:**
- Background: `hsl(222.2 84% 4.9%)`
- Foreground: `hsl(210 40% 98%)`
- Card: `hsl(222.2 84% 4.9%)`
- Muted: `hsl(217.2 32.6% 17.5%)`
- Border: `hsl(217.2 32.6% 17.5%)`
- Primary: `hsl(210 40% 98%)`

---

## 16. Conclusion

This design document provides a comprehensive blueprint for implementing the Articles and Sources pages for the Catchup Feed web application. The design follows established patterns from the existing codebase, maintains consistency with the UI/UX guidelines, and prioritizes accessibility and performance.

### Key Highlights

1. **User-Centric Design**: Clean, minimal interface focused on content readability
2. **Responsive Layout**: Mobile-first approach with adaptive layouts for all screen sizes
3. **Accessibility First**: WCAG 2.1 AA compliance with proper ARIA labels and keyboard navigation
4. **Robust Error Handling**: Comprehensive error, loading, and empty states
5. **Scalable Architecture**: Reusable components and clear separation of concerns
6. **Performance Optimized**: Efficient data fetching, caching, and rendering strategies

### Implementation Timeline

- **Phase 1 (Must Priority)**: 3-4 days for core pages
- **Phase 2 (Should Priority)**: 2-3 days for enhanced features
- **Total Estimated Time**: 5-7 days

This design is ready for implementation by the planner and worker agents in the EDAF workflow.
