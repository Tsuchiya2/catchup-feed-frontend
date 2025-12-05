# Task Plan - Initial Setup, Authentication & Dashboard

**Feature ID**: FEAT-001
**Design Document**: docs/designs/initial-setup-auth-dashboard.md
**Created**: 2025-11-29
**Planner**: planner agent

---

## Metadata

```yaml
task_plan_metadata:
  feature_id: "FEAT-001"
  feature_name: "Initial Setup, Authentication & Dashboard"
  total_tasks: 28
  estimated_duration: "5-7 days"
  critical_path: ["TASK-001", "TASK-002", "TASK-003", "TASK-004", "TASK-005", "TASK-009", "TASK-014", "TASK-019", "TASK-024"]
```

---

## 1. Overview

**Feature Summary**: Establish the foundational Catchup Feed Web application with Next.js 15, implementing JWT-based authentication and a statistics dashboard that integrates with the existing Go backend API.

**Total Tasks**: 28
**Execution Phases**: 6 (Project Setup → Auth Infrastructure → API Client → Frontend Components → Integration → Testing)
**Parallel Opportunities**: 12 tasks can run in parallel after initial setup

**Critical Path**:
1. Project initialization (TASK-001)
2. TypeScript & core dependencies setup (TASK-002, TASK-003)
3. API type generation (TASK-005)
4. Auth infrastructure (TASK-009)
5. Protected routes middleware (TASK-014)
6. Dashboard implementation (TASK-019)
7. Integration testing (TASK-024)

---

## 2. Task Breakdown

### Phase 1: Project Initial Setup

---

### TASK-001: Initialize Next.js 15 Project with App Router

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: None

**Description**:
Create a new Next.js 15 project with App Router enabled, using the latest stable release. Configure the project structure following Next.js 15 best practices.

**Deliverables**:
- File: `package.json` with Next.js 15.x dependencies
- File: `next.config.ts` with App Router configuration
- Directory: `src/app/` with App Router structure
- File: `.gitignore` with Next.js defaults
- File: `tsconfig.json` (basic, will be enhanced in TASK-002)

**Acceptance Criteria**:
- `npx create-next-app@latest` executes successfully
- App Router is enabled (no `pages/` directory)
- Development server starts with `npm run dev` on port 3000
- Default page renders at http://localhost:3000
- Next.js version is 15.x or higher

**Estimated Complexity**: Low

---

### TASK-002: Configure TypeScript Strict Mode

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-001]

**Description**:
Configure TypeScript with strict mode enabled, including all recommended strict flags for type safety. Update tsconfig.json with proper compiler options for Next.js 15.

**Deliverables**:
- File: `tsconfig.json` with strict mode configuration
  - `strict: true`
  - `noUncheckedIndexedAccess: true`
  - `noImplicitOverride: true`
  - `forceConsistentCasingInFileNames: true`
- Path aliases configured (`@/*` → `./src/*`)

**Acceptance Criteria**:
- TypeScript compiles without errors
- `tsc --noEmit` passes
- Strict mode flags are enabled
- Path aliases work in imports

**Estimated Complexity**: Low

---

### TASK-003: Setup Tailwind CSS 4.x

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-001]

**Description**:
Install and configure Tailwind CSS 4.x with Next.js 15 integration. Setup custom theme configuration for the Catchup Feed application.

**Deliverables**:
- File: `tailwind.config.ts` with custom theme
  - Color palette (primary, secondary, accent colors)
  - Typography scale
  - Spacing scale
  - Breakpoints
- File: `src/app/globals.css` with Tailwind directives
- File: `postcss.config.js` with Tailwind plugin

**Acceptance Criteria**:
- Tailwind CSS 4.x installed
- Utility classes work in components
- Custom theme colors apply correctly
- No CSS conflicts or warnings
- Dark mode support configured (class-based)

**Estimated Complexity**: Low

---

### TASK-004: Install and Configure shadcn/ui

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-002, TASK-003]

**Description**:
Install shadcn/ui component library and configure initial components needed for authentication and dashboard (Button, Card, Input, Label, Form components).

**Deliverables**:
- File: `components.json` with shadcn/ui configuration
- Directory: `src/components/ui/` with base components:
  - `button.tsx` - Button component
  - `card.tsx` - Card component
  - `input.tsx` - Input component
  - `label.tsx` - Label component
  - `form.tsx` - Form components
  - `spinner.tsx` - Loading spinner
- File: `src/lib/utils.ts` with cn() helper

**Acceptance Criteria**:
- `npx shadcn-ui@latest init` completes successfully
- All UI components render without errors
- Components follow shadcn/ui patterns (Radix UI + Tailwind)
- TypeScript types are correct for all components
- Components are accessible (ARIA attributes)

**Estimated Complexity**: Medium

---

### TASK-005: Setup TanStack Query v5

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-001]

**Description**:
Install and configure TanStack Query (React Query) v5 for server state management. Setup QueryClient provider with appropriate defaults for caching and refetching.

**Deliverables**:
- Package: `@tanstack/react-query` installed (v5.x)
- Package: `@tanstack/react-query-devtools` installed
- File: `src/providers/QueryProvider.tsx` with QueryClient setup
  - `staleTime: 60000` (60s as per requirements)
  - `gcTime: 300000` (5min garbage collection)
  - `retry: 1`
  - `refetchOnWindowFocus: true`
- File: `src/app/layout.tsx` updated with QueryProvider wrapper
- React Query Devtools enabled in development mode

**Acceptance Criteria**:
- QueryClient initializes without errors
- Devtools appear in development mode
- Cache configuration matches requirements (60s stale time)
- Provider wraps entire application

**Estimated Complexity**: Low

---

### TASK-006: Configure Vitest and React Testing Library

**Responsible Worker**: test-worker-v1-self-adapting

**Dependencies**: [TASK-002]

**Description**:
Setup Vitest as the test runner with React Testing Library for component testing. Configure test environment and utilities for Next.js 15 App Router.

**Deliverables**:
- Package: `vitest` installed
- Package: `@testing-library/react` installed
- Package: `@testing-library/jest-dom` installed
- Package: `@vitejs/plugin-react` installed
- File: `vitest.config.ts` with configuration
  - Test environment: jsdom
  - Coverage provider: v8
  - Setup files configured
- File: `src/test/setup.ts` with global test setup
- File: `src/test/utils.tsx` with testing utilities (renderWithProviders)
- Script: `"test"` in package.json
- Script: `"test:coverage"` in package.json

**Acceptance Criteria**:
- `npm test` runs successfully
- Sample test file passes
- Coverage reports generate correctly
- React Testing Library helpers work with Next.js components
- TypeScript types work in test files

**Estimated Complexity**: Medium

---

### TASK-007: Setup ESLint and Prettier

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-002]

**Description**:
Configure ESLint with Next.js recommended rules and Prettier for code formatting. Setup pre-commit hooks with Husky and lint-staged.

**Deliverables**:
- File: `.eslintrc.json` with Next.js + TypeScript rules
  - Extends: `next/core-web-vitals`
  - Extends: `plugin:@typescript-eslint/recommended`
- File: `.prettierrc` with formatting rules
  - Single quotes: true
  - Tab width: 2
  - Trailing comma: es5
- File: `.prettierignore`
- Package: `husky` installed
- Package: `lint-staged` installed
- File: `.husky/pre-commit` hook
- Script: `"lint"` in package.json
- Script: `"format"` in package.json

**Acceptance Criteria**:
- `npm run lint` passes
- `npm run format` formats code correctly
- Pre-commit hook runs automatically
- No ESLint errors in existing code
- Prettier and ESLint don't conflict

**Estimated Complexity**: Low

---

### TASK-008: Generate TypeScript Types from Backend OpenAPI Spec

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-002]

**Description**:
Setup openapi-typescript to generate TypeScript types from the catchup-feed backend's OpenAPI specification. Configure automatic type generation script.

**Deliverables**:
- Package: `openapi-typescript` installed
- File: `openapi.yaml` (copy from backend repository or fetch from API)
- File: `src/lib/api/types.ts` (generated TypeScript types)
- Script: `"generate:types"` in package.json
  - Command: `openapi-typescript openapi.yaml -o src/lib/api/types.ts`
- File: `.gitignore` updated (do NOT ignore generated types, commit them)

**Acceptance Criteria**:
- Types generated without errors
- All API endpoints have TypeScript types
- Auth token response type exists
- Articles response type exists
- Sources response type exists
- Generated file includes proper JSDoc comments
- Types are committed to git for CI/CD

**Estimated Complexity**: Medium

---

### Phase 2: Authentication Infrastructure

---

### TASK-009: Implement Token Storage Utilities

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-002]

**Description**:
Create utility functions for secure JWT token storage and retrieval using localStorage, with fallback error handling and type safety.

**Deliverables**:
- File: `src/lib/auth/token.ts` with functions:
  - `getAuthToken(): string | null` - Retrieve token from localStorage
  - `setAuthToken(token: string): void` - Store token in localStorage
  - `clearAuthToken(): void` - Remove token from localStorage
  - `isTokenExpired(token: string): boolean` - Check token expiration
- Constant: `AUTH_TOKEN_KEY = 'catchup_feed_auth_token'`
- Error handling for localStorage access failures
- JSDoc documentation for all functions

**Acceptance Criteria**:
- All functions handle localStorage errors gracefully
- Token expiration check works (decode JWT exp claim)
- Functions are pure and side-effect free (except storage)
- TypeScript types are strict (no `any`)
- Unit test coverage ≥90% (TASK-025 will test this)

**Estimated Complexity**: Low

---

### TASK-010: Create Base API Client with JWT Injection

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-008, TASK-009]

**Description**:
Implement a type-safe API client wrapper that automatically injects JWT tokens into requests and handles authentication errors.

**Deliverables**:
- File: `src/lib/api/client.ts` with:
  - Class: `ApiClient` with request() method
  - Type-safe request wrapper using fetch
  - Automatic JWT injection via Authorization header
  - Request timeout handling (30s)
  - 401 error handling (clear token + redirect)
  - Error response parsing
- File: `src/lib/api/errors.ts` with:
  - Class: `ApiError extends Error` with status, message, details
- Environment variable: `NEXT_PUBLIC_API_URL` (default: http://localhost:8080)
- Singleton instance exported

**Acceptance Criteria**:
- All requests include Authorization header when token exists
- 401 responses clear token and redirect to /login
- Request timeout after 30 seconds
- Error responses are properly typed
- No exposed sensitive data in error messages
- TypeScript generics work for response types

**Estimated Complexity**: Medium

---

### TASK-011: Implement Authentication Endpoints

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-010]

**Description**:
Create API functions for authentication endpoints (login) using the type-safe API client. Integrate with backend's /auth/token endpoint.

**Deliverables**:
- File: `src/lib/api/endpoints/auth.ts` with:
  - Function: `login(email: string, password: string): Promise<LoginResponse>`
  - Type: `LoginRequest` interface
  - Type: `LoginResponse` interface (or use generated types)
- Integration with ApiClient
- Error handling for invalid credentials
- TypeScript strict mode compliance

**Acceptance Criteria**:
- login() function sends POST /auth/token
- Request body includes email and password
- Response includes token and expiresAt
- 401 errors throw ApiError with proper message
- Function is fully typed (no `any`)

**Estimated Complexity**: Low

---

### TASK-012: Implement Articles API Endpoints

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-010]

**Description**:
Create API functions for articles endpoints (list articles, get article by ID) with type-safe query parameters and responses.

**Deliverables**:
- File: `src/lib/api/endpoints/articles.ts` with:
  - Function: `getArticles(query?: ArticlesQuery): Promise<ArticlesResponse>`
  - Function: `getArticle(id: string): Promise<ArticleResponse>`
  - Type: `ArticlesQuery` interface (page, limit, sourceId)
  - Type: `ArticlesResponse` interface (or use generated types)
  - Type: `ArticleResponse` interface (or use generated types)
- Query parameter serialization
- Authorization header included automatically

**Acceptance Criteria**:
- getArticles() sends GET /articles with query params
- getArticle() sends GET /articles/:id
- Both functions require authentication (401 if no token)
- Pagination parameters work correctly
- Response types match OpenAPI specification

**Estimated Complexity**: Low

---

### TASK-013: Implement Sources API Endpoints

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-010]

**Description**:
Create API functions for sources endpoints (list sources) with type-safe responses.

**Deliverables**:
- File: `src/lib/api/endpoints/sources.ts` with:
  - Function: `getSources(): Promise<SourcesResponse>`
  - Type: `SourcesResponse` interface (or use generated types)
- Authorization header included automatically

**Acceptance Criteria**:
- getSources() sends GET /sources
- Function requires authentication
- Response type matches OpenAPI specification
- Function is fully typed

**Estimated Complexity**: Low

---

### TASK-014: Create Protected Route Middleware

**Responsible Worker**: backend-worker-v1-self-adapting

**Dependencies**: [TASK-009]

**Description**:
Implement Next.js middleware to protect routes requiring authentication. Redirect unauthenticated users to login page, and authenticated users away from login page.

**Deliverables**:
- File: `src/middleware.ts` with:
  - Middleware function checking token in localStorage (via client-side check)
  - Protected routes: /dashboard, /articles, /sources
  - Public routes: /, /login
  - Redirect logic:
    - Protected page + no token → /login
    - Login page + valid token → /dashboard
  - Matcher configuration excluding static assets
- Type-safe route matching

**Acceptance Criteria**:
- Middleware runs on all routes except static assets
- Unauthenticated users cannot access /dashboard
- Authenticated users skip /login and go to /dashboard
- No infinite redirect loops
- Token validation works correctly
- Edge runtime compatible (no Node.js APIs)

**Estimated Complexity**: Medium

---

### Phase 3: React Query Hooks

---

### TASK-015: Create useAuth Hook

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-011, TASK-005]

**Description**:
Implement custom React hook for authentication state management using React Query. Provide login, logout, and authentication status.

**Deliverables**:
- File: `src/hooks/useAuth.ts` with:
  - Hook: `useAuth()` returning:
    - `isAuthenticated: boolean`
    - `token: string | null`
    - `login: (email: string, password: string) => Promise<void>`
    - `logout: () => void`
    - `isLoading: boolean`
    - `error: Error | null`
  - useMutation for login
  - Token expiration checking
  - Automatic redirect on logout

**Acceptance Criteria**:
- Hook uses React Query useMutation
- login() calls auth API and stores token
- logout() clears token and cache
- isAuthenticated reflects current state
- Hook re-renders on auth state change
- Error states are properly exposed

**Estimated Complexity**: Medium

---

### TASK-016: Create useArticles Hook

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-012, TASK-005]

**Description**:
Implement React Query hook for fetching articles with pagination and filtering. Include cache management with 60s stale time.

**Deliverables**:
- File: `src/hooks/useArticles.ts` with:
  - Hook: `useArticles(query?: ArticlesQuery)` returning:
    - `articles: Article[]`
    - `pagination: PaginationInfo`
    - `isLoading: boolean`
    - `error: Error | null`
    - `refetch: () => void`
  - useQuery with queryKey: `['articles', query]`
  - Stale time: 60000ms (60s)
  - Retry: 1 attempt

**Acceptance Criteria**:
- Hook uses React Query useQuery
- Articles data is cached for 60s
- Pagination parameters work correctly
- Query key includes filter params for cache isolation
- Loading and error states work
- Automatic refetch on window focus

**Estimated Complexity**: Low

---

### TASK-017: Create useSources Hook

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-013, TASK-005]

**Description**:
Implement React Query hook for fetching sources list with cache management.

**Deliverables**:
- File: `src/hooks/useSources.ts` with:
  - Hook: `useSources()` returning:
    - `sources: Source[]`
    - `isLoading: boolean`
    - `error: Error | null`
    - `refetch: () => void`
  - useQuery with queryKey: `['sources']`
  - Stale time: 60000ms (60s)
  - Retry: 1 attempt

**Acceptance Criteria**:
- Hook uses React Query useQuery
- Sources data is cached for 60s
- Loading and error states work
- Automatic refetch on window focus

**Estimated Complexity**: Low

---

### TASK-018: Create useDashboardStats Hook

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-016, TASK-017]

**Description**:
Implement composite React Query hook that combines articles and sources data to provide dashboard statistics.

**Deliverables**:
- File: `src/hooks/useDashboardStats.ts` with:
  - Hook: `useDashboardStats()` returning:
    - `stats: { totalArticles, totalSources, recentArticles }`
    - `isLoading: boolean`
    - `error: Error | null`
  - Uses useArticles({ limit: 10 }) for recent articles
  - Uses useSources() for total sources count
  - Combines both queries' loading states

**Acceptance Criteria**:
- Hook combines useArticles and useSources
- totalArticles comes from pagination.total
- totalSources is sources.length
- recentArticles is first 10 articles
- isLoading is true if either query is loading
- Error prioritizes articles error over sources error

**Estimated Complexity**: Low

---

### Phase 4: UI Components

---

### TASK-019: Create Login Form Component

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-004, TASK-015]

**Description**:
Implement login form component with email/password inputs, validation, error handling, and integration with useAuth hook.

**Deliverables**:
- File: `src/components/auth/LoginForm.tsx` with:
  - Form with email and password inputs (using shadcn/ui Input)
  - Client-side validation (required fields, email format)
  - Submit button with loading state (using shadcn/ui Button)
  - Error message display (using ErrorMessage component)
  - Integration with useAuth().login()
  - Redirect to /dashboard on success
- Accessibility:
  - Proper labels and ARIA attributes
  - Keyboard navigation
  - Error announcements

**Acceptance Criteria**:
- Form validates email format before submission
- Loading spinner shows during login API call
- Error messages display for invalid credentials
- Success redirects to /dashboard
- Form is accessible (WCAG 2.1 AA)
- TypeScript strict mode compliant

**Estimated Complexity**: Medium

---

### TASK-020: Create Dashboard Statistics Cards

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-004, TASK-018]

**Description**:
Implement statistics cards component to display total articles and total sources counts on the dashboard.

**Deliverables**:
- File: `src/components/dashboard/StatisticsCards.tsx` with:
  - Card for total articles (using shadcn/ui Card)
  - Card for total sources (using shadcn/ui Card)
  - Loading skeletons (using shadcn/ui Skeleton)
  - Error state display
  - Integration with useDashboardStats()
  - Responsive grid layout (2 columns desktop, 1 column mobile)

**Acceptance Criteria**:
- Cards display correct statistics from API
- Loading skeletons show during data fetch
- Error messages display gracefully
- Responsive design works on mobile and desktop
- Cards are visually consistent with design system

**Estimated Complexity**: Low

---

### TASK-021: Create Recent Articles List Component

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-004, TASK-018]

**Description**:
Implement component to display list of recent articles (latest 10) with title, description, source, and publish date.

**Deliverables**:
- File: `src/components/dashboard/RecentArticlesList.tsx` with:
  - Article list items (using shadcn/ui Card or List)
  - Each item displays:
    - Article title (link to detail page)
    - Article description (truncated to 150 chars)
    - Source name
    - Published date (formatted)
  - Loading state (skeleton loaders)
  - Empty state ("No articles yet")
  - Error state
  - Integration with useDashboardStats()

**Acceptance Criteria**:
- Displays 10 most recent articles
- Article titles link to /articles/[id]
- Published dates are formatted (e.g., "2 hours ago")
- Description truncates with ellipsis
- Loading skeletons match final layout
- Empty state shows when no articles exist

**Estimated Complexity**: Medium

---

### TASK-022: Create Header Navigation Component

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-004, TASK-015]

**Description**:
Implement header navigation component with app logo, navigation links, and logout button.

**Deliverables**:
- File: `src/components/layout/Header.tsx` with:
  - App logo/title
  - Navigation links (Dashboard, Articles, Sources) - only shown when authenticated
  - Logout button (using shadcn/ui Button)
  - Integration with useAuth().logout()
  - Mobile responsive (hamburger menu on mobile)
  - Active link highlighting

**Acceptance Criteria**:
- Header appears on all pages
- Navigation links only show for authenticated users
- Logout button clears token and redirects to /login
- Active page is visually highlighted
- Mobile menu works (hamburger icon)
- Keyboard navigation works

**Estimated Complexity**: Medium

---

### TASK-023: Create Common UI Components

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-004]

**Description**:
Implement reusable common components for loading states, error messages, and empty states.

**Deliverables**:
- File: `src/components/common/LoadingSpinner.tsx`
  - Centered spinner for page-level loading
  - Inline spinner variant for buttons
- File: `src/components/common/ErrorMessage.tsx`
  - Props: `error: Error | string`, `onRetry?: () => void`
  - Display error message with optional retry button
  - Error icon
- File: `src/components/common/EmptyState.tsx`
  - Props: `title: string`, `description?: string`, `action?: ReactNode`
  - Centered empty state with icon
- All components use shadcn/ui primitives

**Acceptance Criteria**:
- LoadingSpinner has centered and inline variants
- ErrorMessage displays errors gracefully
- EmptyState is reusable across features
- All components are accessible
- TypeScript props are strictly typed

**Estimated Complexity**: Low

---

### Phase 5: Pages Integration

---

### TASK-024: Create Login Page

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-019, TASK-014]

**Description**:
Implement login page at /login using LoginForm component. Include page metadata and layout.

**Deliverables**:
- File: `src/app/(auth)/login/page.tsx` with:
  - LoginForm component
  - Page title "Login - Catchup Feed"
  - Centered layout
  - Metadata for SEO
- File: `src/app/(auth)/layout.tsx` (auth layout)
  - Simple centered layout for auth pages
  - No header/footer

**Acceptance Criteria**:
- Page accessible at /login
- LoginForm renders correctly
- Middleware redirects authenticated users to /dashboard
- Page metadata is correct
- Page is responsive

**Estimated Complexity**: Low

---

### TASK-025: Create Dashboard Page

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-020, TASK-021, TASK-022, TASK-014]

**Description**:
Implement dashboard page at /dashboard with statistics cards and recent articles list. Include header navigation.

**Deliverables**:
- File: `src/app/(protected)/dashboard/page.tsx` with:
  - StatisticsCards component
  - RecentArticlesList component
  - Page title "Dashboard - Catchup Feed"
  - Metadata for SEO
- File: `src/app/(protected)/layout.tsx` (protected layout)
  - Header component
  - Main content area
  - Footer (optional)
- Layout structure:
  - Header at top
  - Statistics cards in grid
  - Recent articles below cards

**Acceptance Criteria**:
- Page accessible at /dashboard (authenticated only)
- Statistics cards display correctly
- Recent articles list displays correctly
- Header navigation works
- Middleware protects page (redirects if not authenticated)
- Page is responsive

**Estimated Complexity**: Medium

---

### TASK-026: Create Root Layout and Providers

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-003, TASK-005]

**Description**:
Implement root layout with global providers (QueryClientProvider), global styles, and metadata configuration.

**Deliverables**:
- File: `src/app/layout.tsx` with:
  - QueryProvider wrapper
  - Global CSS imports
  - HTML lang attribute
  - Metadata configuration:
    - Title: "Catchup Feed - Stay Updated"
    - Description: "Your personalized news aggregator"
  - Font configuration (Inter or similar)
  - Viewport meta tags
- File: `src/app/globals.css` with:
  - Tailwind directives
  - CSS variables for theming
  - Base styles (body, html)

**Acceptance Criteria**:
- QueryProvider wraps all pages
- Global styles apply correctly
- Metadata appears in browser tab and search results
- Font loads correctly
- No hydration errors
- Dark mode CSS variables defined (for future use)

**Estimated Complexity**: Low

---

### TASK-027: Create Landing Page

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-004, TASK-026]

**Description**:
Implement public landing page at / with app description and login link.

**Deliverables**:
- File: `src/app/(public)/page.tsx` with:
  - Hero section with app title and description
  - Features list (optional)
  - "Get Started" button linking to /login
  - Simple, clean design
- File: `src/app/(public)/layout.tsx` (public layout)
  - Minimal layout for public pages

**Acceptance Criteria**:
- Page accessible at /
- "Get Started" button links to /login
- Page is responsive
- Page has proper metadata

**Estimated Complexity**: Low

---

### Phase 6: Testing & Documentation

---

### TASK-028: Write Unit Tests for Auth Utilities

**Responsible Worker**: test-worker-v1-self-adapting

**Dependencies**: [TASK-006, TASK-009]

**Description**:
Write comprehensive unit tests for token storage utilities and authentication functions.

**Deliverables**:
- File: `src/lib/auth/token.test.ts` with tests for:
  - getAuthToken() - retrieves token from localStorage
  - setAuthToken() - stores token in localStorage
  - clearAuthToken() - removes token
  - isTokenExpired() - checks JWT expiration (valid and expired tokens)
  - Error handling for localStorage failures
- Minimum 15 test cases
- Code coverage ≥90%

**Acceptance Criteria**:
- All tests pass
- Coverage report shows ≥90% for token.ts
- Tests mock localStorage correctly
- Edge cases tested (invalid tokens, empty strings)
- Tests run in CI environment

**Estimated Complexity**: Low

---

### TASK-029: Write Unit Tests for API Client

**Responsible Worker**: test-worker-v1-self-adapting

**Dependencies**: [TASK-006, TASK-010]

**Description**:
Write comprehensive unit tests for the base API client, including JWT injection, error handling, and timeout logic.

**Deliverables**:
- File: `src/lib/api/client.test.ts` with tests for:
  - Request with JWT token injection
  - Request without token (unauthenticated)
  - 401 error handling (clears token, redirects)
  - Network timeout (30s)
  - Error response parsing
  - Success response parsing
- Mock fetch API
- Minimum 12 test cases
- Code coverage ≥90%

**Acceptance Criteria**:
- All tests pass
- Coverage report shows ≥90% for client.ts
- fetch is properly mocked
- Error scenarios tested (network errors, timeouts, 401, 500)
- Tests run in CI environment

**Estimated Complexity**: Medium

---

### TASK-030: Write Integration Tests for Authentication Flow

**Responsible Worker**: test-worker-v1-self-adapting

**Dependencies**: [TASK-006, TASK-024, TASK-025]

**Description**:
Write integration tests for the complete authentication flow, from login to dashboard access.

**Deliverables**:
- File: `src/app/(auth)/login/login.test.tsx` with tests for:
  - Successful login flow (enter credentials, submit, redirect to dashboard)
  - Failed login (invalid credentials, error message displayed)
  - Validation errors (empty email, invalid email format)
  - Loading state during login
- File: `src/app/(protected)/dashboard/dashboard.test.tsx` with tests for:
  - Dashboard requires authentication (redirects if not authenticated)
  - Dashboard loads statistics correctly
  - Dashboard displays recent articles
  - Loading states show correctly
- Mock API responses
- Minimum 10 test cases
- Code coverage ≥80% for pages

**Acceptance Criteria**:
- All tests pass
- Login flow is fully tested
- Dashboard rendering is tested
- API calls are mocked correctly
- Tests use React Testing Library best practices

**Estimated Complexity**: High

---

### TASK-031: Write Component Tests for Dashboard Components

**Responsible Worker**: test-worker-v1-self-adapting

**Dependencies**: [TASK-006, TASK-020, TASK-021]

**Description**:
Write unit tests for dashboard-specific components (StatisticsCards, RecentArticlesList).

**Deliverables**:
- File: `src/components/dashboard/StatisticsCards.test.tsx` with tests for:
  - Displays correct statistics
  - Shows loading skeletons
  - Displays error state
  - Responsive layout
- File: `src/components/dashboard/RecentArticlesList.test.tsx` with tests for:
  - Displays articles list
  - Shows loading state
  - Shows empty state
  - Links to article detail pages
  - Truncates long descriptions
- Mock useDashboardStats hook
- Minimum 12 test cases
- Code coverage ≥85%

**Acceptance Criteria**:
- All tests pass
- Components render correctly with mocked data
- Loading and error states tested
- Accessibility tested (ARIA attributes)

**Estimated Complexity**: Medium

---

### TASK-032: Write E2E Tests for Critical User Flows

**Responsible Worker**: test-worker-v1-self-adapting

**Dependencies**: [TASK-024, TASK-025]

**Description**:
Write end-to-end tests using Playwright to test critical user journeys (login to dashboard access).

**Deliverables**:
- Package: `@playwright/test` installed
- File: `playwright.config.ts` with configuration
- File: `e2e/auth-flow.spec.ts` with tests for:
  - User can log in and see dashboard
  - User cannot access dashboard without login
  - User can log out
- File: `e2e/dashboard.spec.ts` with tests for:
  - Dashboard displays statistics
  - Dashboard displays recent articles
  - User can navigate to article detail
- Script: `"test:e2e"` in package.json
- Minimum 5 E2E test scenarios

**Acceptance Criteria**:
- Playwright tests run successfully
- Tests use real backend API (or mocked backend)
- All critical flows covered
- Tests run in headless mode for CI
- Screenshots captured on failure

**Estimated Complexity**: High

---

### TASK-033: Create Project Documentation

**Responsible Worker**: frontend-worker-v1-self-adapting

**Dependencies**: [TASK-027]

**Description**:
Create comprehensive README and developer documentation for the project.

**Deliverables**:
- File: `README.md` with:
  - Project overview
  - Prerequisites (Node.js 18+, npm)
  - Installation instructions
  - Development server setup
  - Environment variables documentation
  - Scripts documentation (dev, build, test, lint)
  - Folder structure explanation
  - API integration notes
- File: `docs/DEVELOPMENT.md` with:
  - Development workflow
  - Code style guide
  - Testing guidelines
  - Component patterns
  - State management patterns
- File: `.env.example` with:
  - `NEXT_PUBLIC_API_URL=http://localhost:8080`

**Acceptance Criteria**:
- README includes all setup steps
- Developer can set up project following README alone
- Environment variables are documented
- Code examples are correct

**Estimated Complexity**: Low

---

## 3. Execution Sequence

### Phase 1: Project Initial Setup (Tasks 1-8)
**Duration**: 1-2 days

- TASK-001: Initialize Next.js 15 Project
- TASK-002: Configure TypeScript (depends on TASK-001)
- TASK-003: Setup Tailwind CSS (depends on TASK-001) **[Can parallel with TASK-002]**
- TASK-004: Install shadcn/ui (depends on TASK-002, TASK-003)
- TASK-005: Setup TanStack Query (depends on TASK-001) **[Can parallel with TASK-002-004]**
- TASK-006: Configure Vitest (depends on TASK-002) **[Can parallel with TASK-003-005]**
- TASK-007: Setup ESLint and Prettier (depends on TASK-002) **[Can parallel with TASK-003-006]**
- TASK-008: Generate OpenAPI Types (depends on TASK-002) **[Can parallel with TASK-003-007]**

**Parallel Opportunities**: TASK-002, TASK-003, TASK-005, TASK-006, TASK-007, TASK-008 can run in parallel after TASK-001

**Critical**: TASK-001 → TASK-002 → TASK-008 (needed for API types)

---

### Phase 2: Authentication Infrastructure (Tasks 9-14)
**Duration**: 1-2 days

- TASK-009: Token Storage Utilities (depends on TASK-002)
- TASK-010: Base API Client (depends on TASK-008, TASK-009)
- TASK-011: Auth Endpoints (depends on TASK-010)
- TASK-012: Articles Endpoints (depends on TASK-010) **[Can parallel with TASK-011]**
- TASK-013: Sources Endpoints (depends on TASK-010) **[Can parallel with TASK-011-012]**
- TASK-014: Protected Route Middleware (depends on TASK-009) **[Can parallel with TASK-010-013]**

**Parallel Opportunities**: TASK-011, TASK-012, TASK-013 can run in parallel after TASK-010

**Critical**: TASK-008 → TASK-009 → TASK-010 → TASK-011

---

### Phase 3: React Query Hooks (Tasks 15-18)
**Duration**: 0.5-1 day

- TASK-015: useAuth Hook (depends on TASK-011, TASK-005)
- TASK-016: useArticles Hook (depends on TASK-012, TASK-005) **[Can parallel with TASK-015]**
- TASK-017: useSources Hook (depends on TASK-013, TASK-005) **[Can parallel with TASK-015-016]**
- TASK-018: useDashboardStats Hook (depends on TASK-016, TASK-017)

**Parallel Opportunities**: TASK-015, TASK-016, TASK-017 can run in parallel

**Critical**: TASK-005 → TASK-015 → TASK-018

---

### Phase 4: UI Components (Tasks 19-23)
**Duration**: 1-2 days

- TASK-019: Login Form Component (depends on TASK-004, TASK-015)
- TASK-020: Dashboard Statistics Cards (depends on TASK-004, TASK-018) **[Can parallel with TASK-019]**
- TASK-021: Recent Articles List (depends on TASK-004, TASK-018) **[Can parallel with TASK-019-020]**
- TASK-022: Header Navigation (depends on TASK-004, TASK-015) **[Can parallel with TASK-019-021]**
- TASK-023: Common UI Components (depends on TASK-004) **[Can parallel with TASK-019-022]**

**Parallel Opportunities**: All tasks in this phase can run in parallel after TASK-004, TASK-015, TASK-018

**Critical**: TASK-004 → TASK-019

---

### Phase 5: Pages Integration (Tasks 24-27)
**Duration**: 0.5-1 day

- TASK-024: Login Page (depends on TASK-019, TASK-014)
- TASK-025: Dashboard Page (depends on TASK-020, TASK-021, TASK-022, TASK-014) **[Can parallel with TASK-026-027]**
- TASK-026: Root Layout (depends on TASK-003, TASK-005) **[Can parallel with TASK-024-025]**
- TASK-027: Landing Page (depends on TASK-004, TASK-026) **[Can parallel with TASK-024-025]**

**Parallel Opportunities**: TASK-024, TASK-025, TASK-026, TASK-027 can overlap significantly

**Critical**: TASK-019 → TASK-024, TASK-020/021/022 → TASK-025

---

### Phase 6: Testing & Documentation (Tasks 28-33)
**Duration**: 1-2 days

- TASK-028: Auth Utilities Tests (depends on TASK-006, TASK-009)
- TASK-029: API Client Tests (depends on TASK-006, TASK-010) **[Can parallel with TASK-028]**
- TASK-030: Auth Flow Integration Tests (depends on TASK-006, TASK-024, TASK-025)
- TASK-031: Dashboard Component Tests (depends on TASK-006, TASK-020, TASK-021) **[Can parallel with TASK-030]**
- TASK-032: E2E Tests (depends on TASK-024, TASK-025) **[Can parallel with TASK-028-031]**
- TASK-033: Project Documentation (depends on TASK-027) **[Can parallel with all tests]**

**Parallel Opportunities**: All testing tasks can run in parallel

**Critical**: TASK-006 → TASK-028/029/030/031

---

## 4. Risk Assessment

### Technical Risks

**RISK-01: Next.js 15 App Router Compatibility** (Medium)
- **Description**: Next.js 15 is relatively new, potential for breaking changes or limited documentation
- **Impact**: Delays in setup, workarounds needed
- **Mitigation**:
  - Use stable Next.js 15 release (not canary)
  - Refer to official migration guide
  - Test middleware early (TASK-014)
  - Fallback to Next.js 14 if critical issues found

**RISK-02: Backend API Availability** (Medium)
- **Description**: Catchup-feed backend API must be running on localhost:8080 for development and testing
- **Impact**: Frontend development blocked, tests fail
- **Mitigation**:
  - Set up backend API early in development
  - Document backend setup in README (TASK-033)
  - Use MSW (Mock Service Worker) for API mocking in tests
  - Create mock API responses for offline development

**RISK-03: TypeScript Strict Mode Errors** (Low)
- **Description**: Strict mode may reveal type errors in dependencies or generated code
- **Impact**: Compilation errors, need for type assertions
- **Mitigation**:
  - Fix type errors incrementally
  - Use `ts-ignore` sparingly for third-party library issues
  - Report type issues to library maintainers
  - TASK-002 validates this early

**RISK-04: OpenAPI Type Generation Issues** (Medium)
- **Description**: Generated types may not match backend responses exactly
- **Impact**: Runtime type mismatches, API errors
- **Mitigation**:
  - Validate generated types against actual API responses (TASK-008)
  - Add runtime validation with zod if needed
  - Keep openapi.yaml updated when backend changes
  - Test API integration early (TASK-030)

**RISK-05: JWT Token Security in localStorage** (Medium)
- **Description**: localStorage is vulnerable to XSS attacks
- **Impact**: Potential token theft
- **Mitigation**:
  - Implement CSP headers (documented in design)
  - Use React's default XSS protection
  - Consider httpOnly cookies in future iterations
  - Document security considerations (TASK-033)

### Dependency Risks

**RISK-06: Critical Path Dependencies** (High)
- **Description**: Long critical path (TASK-001 → TASK-002 → TASK-008 → TASK-009 → TASK-010 → TASK-011 → TASK-015 → TASK-019 → TASK-024)
- **Impact**: Delays in one task block many subsequent tasks
- **Mitigation**:
  - Prioritize critical path tasks
  - Start parallel tasks immediately after blockers clear
  - Use mock data to unblock frontend development
  - Assign experienced developers to critical path

**RISK-07: Test Environment Setup** (Low)
- **Description**: Vitest and Playwright may have configuration issues
- **Impact**: Test tasks delayed, CI/CD blocked
- **Mitigation**:
  - Test Vitest setup early (TASK-006)
  - Use official Next.js testing templates
  - Document test setup thoroughly (TASK-033)
  - Allocate extra time for TASK-032 (E2E tests)

### Resource Risks

**RISK-08: Worker Agent Availability** (Low)
- **Description**: Multiple tasks require the same worker (frontend-worker-v1-self-adapting)
- **Impact**: Sequential execution despite parallelization opportunities
- **Mitigation**:
  - Workers are AI agents and can run in parallel
  - Plan task batches to maximize parallelization
  - Prioritize critical path over parallel tasks

**RISK-09: Knowledge Transfer** (Low)
- **Description**: Different workers need to understand code written by others
- **Impact**: Integration issues, inconsistent patterns
- **Mitigation**:
  - Establish clear coding conventions (TASK-007)
  - Use TypeScript for type safety
  - Write comprehensive documentation (TASK-033)
  - Review integration points carefully (TASK-024-027)

### Mitigation Strategy Summary

1. **Early Validation**: Execute TASK-001-008 thoroughly to catch infrastructure issues early
2. **Parallel Execution**: Maximize use of parallel opportunities to reduce total duration
3. **Mock Data**: Create mock API responses to unblock frontend development if backend unavailable
4. **Incremental Testing**: Test each component individually (TASK-028-032) to catch bugs early
5. **Documentation**: Maintain clear documentation (TASK-033) for knowledge sharing
6. **Fallback Plans**: Have alternative approaches ready (e.g., Next.js 14 instead of 15)

---

## 5. Parallel Execution Opportunities

### Batch 1: Initial Setup (After TASK-001)
- TASK-002 (TypeScript)
- TASK-003 (Tailwind)
- TASK-005 (TanStack Query)

### Batch 2: Dev Tools (After TASK-002)
- TASK-006 (Vitest)
- TASK-007 (ESLint/Prettier)
- TASK-008 (OpenAPI Types)

### Batch 3: API Endpoints (After TASK-010)
- TASK-011 (Auth Endpoints)
- TASK-012 (Articles Endpoints)
- TASK-013 (Sources Endpoints)

### Batch 4: React Hooks (After TASK-005, TASK-011-013)
- TASK-015 (useAuth)
- TASK-016 (useArticles)
- TASK-017 (useSources)

### Batch 5: UI Components (After TASK-004, TASK-015, TASK-018)
- TASK-019 (Login Form)
- TASK-020 (Statistics Cards)
- TASK-021 (Articles List)
- TASK-022 (Header)
- TASK-023 (Common Components)

### Batch 6: Pages (After TASK-019-023)
- TASK-024 (Login Page)
- TASK-025 (Dashboard Page)
- TASK-026 (Root Layout)
- TASK-027 (Landing Page)

### Batch 7: Testing (After TASK-006, components ready)
- TASK-028 (Auth Tests)
- TASK-029 (API Tests)
- TASK-030 (Integration Tests)
- TASK-031 (Component Tests)
- TASK-032 (E2E Tests)
- TASK-033 (Documentation) **[Can run anytime after TASK-027]**

---

## 6. Definition of Done (Overall)

### Functional Completeness
- ✅ All 33 tasks completed
- ✅ Users can log in with email/password
- ✅ Dashboard displays total articles and sources counts
- ✅ Dashboard shows 10 most recent articles
- ✅ Protected routes require authentication
- ✅ Logout functionality works correctly

### Code Quality
- ✅ TypeScript strict mode passes with no errors
- ✅ ESLint passes with no warnings
- ✅ Prettier formatting applied consistently
- ✅ No console errors in browser
- ✅ Code follows established patterns

### Testing
- ✅ All unit tests pass (`npm test`)
- ✅ Code coverage ≥80% for critical paths (auth, API client)
- ✅ Integration tests pass
- ✅ E2E tests pass
- ✅ Tests run successfully in CI environment

### Performance
- ✅ Initial page load (LCP) < 2.5s
- ✅ Time to Interactive (TTI) < 3.5s
- ✅ No unnecessary re-renders
- ✅ API responses cached for 60s

### Security
- ✅ JWT tokens stored securely
- ✅ Authorization headers included in API requests
- ✅ 401 errors handled (redirect to login)
- ✅ No sensitive data in URLs
- ✅ CSP headers configured

### Accessibility
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Proper ARIA labels

### Documentation
- ✅ README with setup instructions
- ✅ Environment variables documented
- ✅ API integration documented
- ✅ Code comments for complex logic

### Deployment Readiness
- ✅ Build succeeds (`npm run build`)
- ✅ Production build runs locally
- ✅ Environment variables configured
- ✅ No hardcoded localhost URLs (except .env.example)

---

## 7. Notes for Worker Agents

### For frontend-worker-v1-self-adapting:
- Use Next.js 15 App Router patterns (not Pages Router)
- All components should be Server Components by default, use `'use client'` only when needed
- Follow shadcn/ui component patterns (Radix UI + Tailwind)
- Ensure accessibility (ARIA labels, keyboard navigation)
- Use TypeScript strict mode (no `any` types)

### For backend-worker-v1-self-adapting:
- API client should use fetch API (native to Next.js)
- All API functions must be fully typed using OpenAPI-generated types
- Handle errors gracefully (don't expose backend stack traces)
- Validate tokens before API requests
- Use environment variables for API URL

### For test-worker-v1-self-adapting:
- Use Vitest + React Testing Library for component tests
- Use Playwright for E2E tests
- Mock API responses using MSW (Mock Service Worker)
- Aim for ≥80% code coverage on critical paths
- Test accessibility (ARIA attributes, keyboard navigation)
- Write descriptive test names (should... when...)

---

**This task plan is ready for evaluation by planner-evaluators.**
