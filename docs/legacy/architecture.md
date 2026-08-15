# System Architecture

**Project**: catchup-feed-frontend
**Version**: 1.1.0
**Last Updated**: 2026-01-10

## Table of Contents

1. [Overview](#overview)
2. [Architecture Pattern](#architecture-pattern)
3. [System Components](#system-components)
4. [Technology Stack](#technology-stack)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [State Management](#state-management)
8. [Caching Strategy](#caching-strategy)
9. [Observability](#observability)
10. [Build and Deployment](#build-and-deployment)
11. [Performance Optimizations](#performance-optimizations)

---

## Overview

Catchup Feed is a Next.js-based frontend application that provides a personalized news aggregation and reading experience. The application integrates with a Go backend API and implements a modern, secure, and performant architecture using React Server Components, client-side state management, and progressive enhancement features.

### Key Characteristics

- **Framework**: Next.js 16.1.1 with App Router (React Server Components) and Turbopack
- **Language**: TypeScript (strict mode)
- **Deployment Model**: Server-Side Rendering (SSR) + Static Site Generation (SSG)
- **API Communication**: REST with Go backend
- **Authentication**: JWT-based with refresh tokens
- **Security**: CSRF protection, secure headers, content security policy
- **PWA**: Progressive Web App with Serwist service worker

---

## Architecture Pattern

The application follows a **Layered Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  (React Server Components + Client Components)              │
│  - app/(protected)/*   : Protected pages                    │
│  - app/(auth)/*        : Authentication pages               │
│  - components/*        : Reusable UI components             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (Business Logic + State Management)                        │
│  - hooks/*            : React Query hooks                   │
│  - providers/*        : Context providers                   │
│  - lib/features/*     : Feature flags                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  (API Communication + Data Transformation)                  │
│  - lib/api/client.ts     : HTTP client                      │
│  - lib/api/endpoints/*   : API endpoint functions           │
│  - types/api.d.ts        : Type definitions                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  (Cross-cutting Concerns)                                   │
│  - proxy.ts              : Next.js 16 Edge proxy            │
│  - sw.ts                 : Serwist service worker (PWA)     │
│  - lib/auth/*            : Authentication utilities         │
│  - lib/security/*        : CSRF protection                  │
│  - lib/observability/*   : Logging, metrics, tracing        │
│  - config/*              : Application configuration        │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │   Go Backend API  │
                    │  (REST + JWT)     │
                    └──────────────────┘
```

---

## System Components

### 1. Presentation Layer

#### Server Components (Default)
- **Location**: `src/app/**/*.tsx` (pages)
- **Purpose**: Initial rendering, SEO optimization, data fetching
- **Example**:
  ```typescript
  // src/app/(protected)/dashboard/page.tsx
  export default function DashboardPage() {
    // Server component - renders on server first
    return <DashboardContent />;
  }
  ```

#### Client Components
- **Location**: `src/components/**/*.tsx`
- **Marker**: `'use client'` directive
- **Purpose**: Interactive UI, state management, browser APIs
- **Example**:
  ```typescript
  // src/components/auth/LoginForm.tsx
  'use client';

  export function LoginForm({ onLogin }: LoginFormProps) {
    const { login, isLoading, error } = useAuth();
    // Interactive form with React hooks
  }
  ```

#### Route Groups
The application uses Next.js route groups for organizational structure:

```
app/
├── (auth)/              # Public authentication pages
│   └── login/           # Login page
├── (protected)/         # Protected pages requiring authentication
│   ├── dashboard/       # Dashboard page
│   ├── articles/        # Articles listing and detail
│   └── sources/         # Sources management
├── (legal)/             # Legal pages (privacy, terms)
│   ├── privacy/
│   └── terms/
└── api/                 # API routes (Next.js routes, not main API)
    ├── health/          # Health check endpoint
    └── articles/search/ # Article search proxy
```

### 2. Proxy Layer (Next.js 16)

**File**: `src/proxy.ts` (renamed from `middleware.ts`)
**Runtime**: Next.js Edge Runtime
**Responsibilities**:

1. **Authentication Check**: Validates JWT tokens from cookies
2. **CSRF Protection**: Validates CSRF tokens for state-changing requests
3. **Route Protection**: Redirects unauthenticated users to login
4. **Token Management**: Sets CSRF tokens in cookies and headers

**Breaking Change in Next.js 16**: Function must be named `proxy` instead of `middleware`

```typescript
// Proxy execution flow (Next.js 16)
export function proxy(request: NextRequest) {
  // Phase 1: CSRF Validation (for POST/PUT/PATCH/DELETE)
  if (STATE_CHANGING_METHODS.includes(method)) {
    validateCsrfToken(request);
  }

  // Phase 2: Authentication Check
  const token = request.cookies.get('catchup_feed_auth_token');
  const hasValidToken = token ? isTokenValid(token) : false;

  if (isProtectedRoute(pathname) && !hasValidToken) {
    return NextResponse.redirect('/login');
  }

  // Phase 3: Set CSRF Token
  setCsrfToken(response);

  return response;
}
```

### 2.1 Service Worker Layer (PWA)

**File**: `src/sw.ts`
**Library**: Serwist 9.x (replaces Workbox)
**Purpose**: Progressive Web App functionality with offline support

**Features**:
- Precaching with automatic cache manifest injection
- 5 runtime caching strategies for different resource types
- Automatic cache cleanup for outdated entries
- Navigation preload for faster page loads
- Skip waiting and immediate client claiming for instant updates

**Caching Strategies**:
1. **Google Fonts Stylesheets** (CacheFirst, 1 year, max 10 entries)
2. **Google Static Fonts** (CacheFirst, 1 year, max 10 entries)
3. **Images** (CacheFirst, 30 days, max 100 entries)
4. **Static Resources** (JS/CSS/fonts) (StaleWhileRevalidate, 1 day, max 50 entries)
5. **API Requests** (NetworkFirst with 10s timeout, 1 hour cache, max 100 entries)

### 3. API Client Layer

**File**: `src/lib/api/client.ts`
**Pattern**: Singleton with retry logic and automatic token injection

**Features**:
- Automatic JWT token injection
- Automatic token refresh before expiration
- CSRF token management
- Retry with exponential backoff
- Request/response tracing
- Error handling and transformation

```typescript
// API Client Architecture
class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  // Core request method with retry logic
  async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
    // 1. Ensure valid token (auto-refresh if needed)
    await this.ensureValidToken(requiresAuth);

    // 2. Prepare headers (JWT, CSRF, tracing)
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': getCsrfToken(),
      'X-Request-ID': getRequestId(),
    };

    // 3. Execute with retry logic
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.executeRequest(endpoint, options);
      } catch (error) {
        if (!this.isRetryableError(error)) throw error;
        await this.sleep(calculateDelay(attempt));
      }
    }
  }
}
```

### 4. State Management

**Library**: TanStack Query (React Query) v5
**Provider**: `src/providers/QueryProvider.tsx`

**Configuration**:
```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,        // 60 seconds
      gcTime: 300000,          // 5 minutes (cache time)
      retry: 1,                // Retry failed requests once
      refetchOnWindowFocus: true,
    },
  },
})
```

**Query Hooks Pattern**:
```typescript
// src/hooks/useArticles.ts
export function useArticles(query?: ArticlesQuery): UseArticlesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', query ?? {}],
    queryFn: async () => await getArticles(query),
    staleTime: 60000,
  });

  return {
    articles: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
}
```

### 5. Authentication System

**Components**:
1. **TokenManager** (`src/lib/auth/TokenManager.ts`)
   - Singleton pattern for token storage
   - Multi-tab synchronization via BroadcastChannel
   - In-memory fallback when localStorage blocked
   - Automatic token expiry detection

2. **Authentication Hook** (`src/hooks/useAuth.ts`)
   - Login mutation with React Query
   - Token storage in cookies for middleware
   - User context setting for observability
   - Automatic redirect on success/failure

3. **API Client Integration**
   - Automatic token refresh when expiring soon (5 minutes threshold)
   - Concurrent request deduplication during refresh
   - Token injection in Authorization header

**Authentication Flow**:
```
┌──────────┐    1. Login     ┌─────────────┐
│  Client  │ ──────────────> │   Backend   │
└──────────┘                 └─────────────┘
      │                             │
      │       2. JWT + Refresh      │
      │ <──────────────────────────┘
      │
      ├─── 3. Store in TokenManager (localStorage/memory)
      ├─── 4. Set in cookie (for middleware)
      ├─── 5. Set user context (Sentry)
      └─── 6. Redirect to dashboard
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with SSR/SSG and Turbopack |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe development |
| **TanStack Query** | 5.90.11 | Server state management |
| **TailwindCSS** | 4.0.0 | Utility-first CSS |
| **Radix UI** | 2.x | Headless component primitives |

### Development & Testing

| Technology | Purpose |
|------------|---------|
| **Vitest** | Unit and integration testing |
| **Playwright** | End-to-end testing |
| **Testing Library** | Component testing utilities |
| **Storybook** | Component development and documentation |
| **ESLint + Prettier** | Code quality and formatting |

### Security & Observability

| Technology | Purpose |
|------------|---------|
| **Sentry** | Error tracking and performance monitoring |
| **Jose** | JWT token handling |
| **Zod** | Runtime type validation |
| **@serwist/next** | Next.js PWA integration (replaces next-pwa) |
| **serwist** | Service worker runtime library |

### Build Tools

| Technology | Purpose |
|------------|---------|
| **@next/bundle-analyzer** | Bundle size analysis |
| **openapi-typescript** | API type generation from OpenAPI spec |

---

## Data Flow

### 1. Article Listing Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Request /articles
       ↓
┌─────────────────────────────────┐
│  Next.js Server (SSR)           │
│  - Render ArticlesPage (RSC)   │
└───────────┬─────────────────────┘
            │
            │ 2. Hydrate with client component
            ↓
┌──────────────────────────────────┐
│  Client Component                │
│  - useArticles() hook            │
└───────────┬──────────────────────┘
            │
            │ 3. React Query fetch
            ↓
┌──────────────────────────────────┐
│  API Client                      │
│  - Add JWT token                 │
│  - Add CSRF token                │
│  - Add tracing headers           │
└───────────┬──────────────────────┘
            │
            │ 4. HTTP GET /articles?page=1&limit=10
            ↓
┌──────────────────────────────────┐
│  Go Backend API                  │
│  - Validate JWT                  │
│  - Fetch from database           │
│  - Return paginated response     │
└───────────┬──────────────────────┘
            │
            │ 5. { data: Article[], pagination: {...} }
            ↓
┌──────────────────────────────────┐
│  API Client                      │
│  - Validate response structure   │
│  - Normalize article data        │
│  - Track performance metrics     │
└───────────┬──────────────────────┘
            │
            │ 6. Cached in React Query
            ↓
┌──────────────────────────────────┐
│  UI Component                    │
│  - Render articles               │
│  - Show pagination controls      │
└──────────────────────────────────┘
```

### 2. Authentication Flow

```
┌─────────────┐
│ LoginForm   │
└──────┬──────┘
       │ 1. Submit email + password
       ↓
┌─────────────────────────────────┐
│  useAuth() hook                 │
│  - loginMutation.mutate()       │
└───────────┬─────────────────────┘
            │ 2. Call login API
            ↓
┌─────────────────────────────────┐
│  API Client (no auth required)  │
│  POST /auth/token               │
│  { email, password }            │
└───────────┬─────────────────────┘
            │
            │ 3. Validate credentials
            ↓
┌─────────────────────────────────┐
│  Go Backend                     │
│  - Verify password hash         │
│  - Generate JWT + refresh token │
└───────────┬─────────────────────┘
            │
            │ 4. { token, refresh_token }
            ↓
┌─────────────────────────────────┐
│  useAuth() onSuccess            │
│  - setAuthToken()               │
│  - setRefreshToken()            │
│  - Set cookie for middleware    │
│  - setUserContext() for Sentry  │
│  - router.push('/dashboard')    │
└─────────────────────────────────┘
```

### 3. Token Refresh Flow

```
┌─────────────────────────────────┐
│  API Client                     │
│  - ensureValidToken()           │
└───────────┬─────────────────────┘
            │
            │ Check: isTokenExpiringSoon()?
            ↓
┌─────────────────────────────────┐
│  TokenManager                   │
│  - Get expiry from JWT payload  │
│  - Compare with threshold (5m)  │
└───────────┬─────────────────────┘
            │
            │ Yes, refresh needed
            ↓
┌─────────────────────────────────┐
│  refreshToken()                 │
│  - Prevent concurrent refreshes │
│  - Retry with exponential back  │
└───────────┬─────────────────────┘
            │
            │ POST /auth/refresh
            │ { refresh_token }
            ↓
┌─────────────────────────────────┐
│  Go Backend                     │
│  - Validate refresh token       │
│  - Generate new access token    │
└───────────┬─────────────────────┘
            │
            │ { token, refresh_token }
            ↓
┌─────────────────────────────────┐
│  TokenManager                   │
│  - Update tokens in storage     │
│  - Update cookie                │
│  - Broadcast to other tabs      │
└─────────────────────────────────┘
```

---

## Security Architecture

### 1. Authentication Security

**JWT Token Management**:
- **Storage**:
  - Primary: `localStorage` (in TokenManager)
  - Secondary: In-memory fallback (private browsing mode)
  - Cookie: For middleware validation (HttpOnly not set for client access)
- **Expiration**: Tokens expire after configured duration
- **Refresh**: Automatic refresh 5 minutes before expiration
- **Validation**:
  - Middleware: Expiry check only (signature verified by backend)
  - Backend: Full signature verification

**Token Security**:
```typescript
// Token structure validation
function isTokenValid(token: string): boolean {
  const payload = decodeJwt(token);
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const bufferMs = 30 * 1000; // 30-second clock skew buffer

  return currentTime < expirationTime + bufferMs;
}
```

### 2. CSRF Protection

**Pattern**: Double Submit Cookie
**Implementation**: Server-side (middleware) + Client-side (API client)

**How It Works**:

1. **Server Sets Token** (in middleware):
   ```typescript
   // Generate cryptographically secure token (32 bytes)
   const token = generateCsrfToken();

   // Set HttpOnly cookie (cannot be read by JavaScript)
   response.cookies.set('csrf_token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 60 * 60 * 24, // 24 hours
   });

   // Set response header (for client to read)
   response.headers.set('X-CSRF-Token', token);
   ```

2. **Client Stores Token**:
   ```typescript
   // CsrfTokenManager extracts from response header
   const token = response.headers.get('X-CSRF-Token');
   sessionStorage.setItem('catchup_feed_csrf_token', token);
   ```

3. **Client Sends Token** (for POST/PUT/PATCH/DELETE):
   ```typescript
   // API client adds token to request headers
   headers['X-CSRF-Token'] = getCsrfToken();
   ```

4. **Server Validates** (in middleware):
   ```typescript
   const cookieToken = request.cookies.get('csrf_token')?.value;
   const headerToken = request.headers.get('X-CSRF-Token');

   // Both must exist and match (constant-time comparison)
   if (!timingSafeEqual(cookieToken, headerToken)) {
     return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
   }
   ```

**Security Features**:
- **Cryptographic Randomness**: Web Crypto API (`crypto.getRandomValues`)
- **Timing Attack Prevention**: Constant-time string comparison
- **SameSite Cookies**: Prevents cross-site sending
- **Automatic Renewal**: New token on page reload
- **Error Recovery**: Auto-reload on CSRF failure (once)

### 3. Content Security Policy

**Implemented in**: `next.config.ts`

```typescript
headers: [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // Next.js requires unsafe-eval
      "style-src 'self' 'unsafe-inline'",                 // Tailwind requires unsafe-inline
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      `connect-src 'self' ${apiUrl}`,                     // Allow API calls
      "frame-ancestors 'self'",
    ].join('; '),
  },
]
```

### 4. Security Headers

All security headers are configured in `next.config.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| **Strict-Transport-Security** | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| **X-Frame-Options** | `SAMEORIGIN` | Prevent clickjacking |
| **X-Content-Type-Options** | `nosniff` | Prevent MIME sniffing |
| **X-XSS-Protection** | `1; mode=block` | Enable XSS filter |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Control referrer info |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Disable unnecessary features |

---

## State Management

### 1. Server State (React Query)

**Managed by**: TanStack Query
**Scope**: API data (articles, sources, user data)

**Cache Strategy**:
```typescript
{
  staleTime: 60000,    // Data is fresh for 60 seconds
  gcTime: 300000,      // Cache for 5 minutes
  retry: 1,            // Retry failed requests once
  refetchOnWindowFocus: true,  // Refresh on window focus
}
```

**Query Keys**:
```typescript
['articles', { page: 1, limit: 10 }]           // Articles list
['articles', 'search', { keyword: 'react' }]   // Article search
['article', 123]                                // Single article
['sources']                                     // Sources list
['sources', 'search', { keyword: 'tech' }]     // Source search
```

### 2. Client State (React Hooks)

**Managed by**: React useState, useEffect
**Scope**: UI state (modals, forms, filters)

**Examples**:
- Login form state
- Search filters
- Pagination state
- Modal open/close
- Theme preference

### 3. Authentication State

**Managed by**: TokenManager singleton + React Query
**Scope**: User authentication status

```typescript
// TokenManager (singleton)
- In-memory token storage
- localStorage persistence
- Multi-tab sync via BroadcastChannel

// useAuth hook
- Login mutation
- Logout function
- isAuthenticated status
```

### 4. Global State (Context Providers)

**Providers**:
1. **QueryProvider**: React Query client
2. **ThemeProvider**: Dark/light theme (next-themes)

```typescript
// app/layout.tsx
<ThemeProvider>
  <QueryProvider>
    {children}
  </QueryProvider>
</ThemeProvider>
```

---

## Caching Strategy

### 1. React Query Cache

**Purpose**: Cache API responses to reduce network requests

**Cache Behavior**:
```typescript
// Fresh data (0-60s): Return from cache, no refetch
// Stale data (60s-5m): Return from cache, refetch in background
// Expired data (>5m): Cleared from memory
```

**Automatic Invalidation**:
```typescript
// After creating a source
queryClient.invalidateQueries({ queryKey: ['sources'] });

// After updating an article
queryClient.invalidateQueries({ queryKey: ['articles'] });
```

### 2. Next.js Build Cache

**Static Pages** (generated at build time):
- `/login`
- `/privacy`
- `/terms`

**Dynamic Pages** (rendered on request):
- `/dashboard`
- `/articles`
- `/sources`

### 3. Service Worker Cache (PWA with Serwist)

**Enabled in**: Production only
**Configured in**: `next.config.ts` and `src/sw.ts`
**Library**: Serwist 9.x (modern Workbox alternative)

**Caching Strategies**:

| Resource Type | Strategy | Cache Name | Duration | Max Entries |
|---------------|----------|------------|----------|-------------|
| **Google Fonts Stylesheets** | CacheFirst | google-fonts-cache | 1 year | 10 |
| **Google Static Fonts** | CacheFirst | gstatic-fonts-cache | 1 year | 10 |
| **Images** | CacheFirst | image-cache | 30 days | 100 |
| **JS/CSS/Fonts** | StaleWhileRevalidate | static-resources-cache | 1 day | 50 |
| **API Calls** | NetworkFirst (10s timeout) | api-cache | 1 hour | 100 |

**Serwist Configuration** (`src/sw.ts`):
```typescript
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.origin === 'https://fonts.googleapis.com',
      handler: new CacheFirst({
        cacheName: 'google-fonts-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      }),
    },
    // ... 4 more strategies
  ],
});

serwist.addEventListeners();
```

**Next.js Integration** (`next.config.ts`):
```typescript
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

export default withSerwist(nextConfig);
```

### 4. HTTP Cache Headers

**Static Assets**:
```
Cache-Control: public, max-age=31536000, immutable
```

**API Responses**:
```
Cache-Control: no-cache, must-revalidate
```

---

## Observability

### 1. Error Tracking

**Service**: Sentry
**Configuration**: `src/lib/observability/`

**Initialized in**: `instrumentation.ts` (Next.js 16 convention)

**Features**:
- Automatic error capture (client + server)
- Performance monitoring (traces, spans)
- User context tracking
- Breadcrumbs for debugging
- Release tracking

```typescript
// Error tracking with user context
setUserContext({
  id: user.id,
  email: user.email,
});

// Errors automatically include user context
```

### 2. Custom Metrics

**Implementation**: `src/lib/observability/metrics.ts`

**Metric Categories**:

| Category | Metrics | Example |
|----------|---------|---------|
| **Authentication** | login.success, login.failure, token.refresh | `metrics.login.success()` |
| **Articles** | article.view, article.search, list.load | `metrics.article.view(articleId)` |
| **Performance** | api.latency, page.load, bundle.size | `metrics.performance.apiLatency(endpoint, ms)` |
| **Errors** | error.api, error.network, error.javascript | `metrics.error.api(endpoint, status)` |

```typescript
// Track custom metrics
metrics.login.success();
metrics.performance.apiLatency('/articles', 150, 200);
metrics.article.search('react');
```

### 3. Distributed Tracing

**Implementation**: `src/lib/observability/tracing.ts`

**Features**:
- Request ID generation (UUID v4)
- Trace propagation to backend via headers
- Span creation for operations
- Integration with Sentry

```typescript
// Add tracing headers to API requests
const headers = addTracingHeaders({
  'Content-Type': 'application/json',
});
// Headers include:
// - X-Request-ID: <uuid>
// - X-Trace-ID: <sentry-trace-id>

// Create spans for operations
await startSpan('Fetch Articles', 'http.client', async () => {
  return await apiClient.get('/articles');
});
```

### 4. Structured Logging

**Implementation**: `src/lib/logger.ts`

**Log Levels**:
- `DEBUG`: Verbose debugging (filtered in production)
- `INFO`: General information
- `WARN`: Warning messages
- `ERROR`: Error messages (never sampled)

**Features**:
- Environment-based formatting (JSON in production, pretty in dev)
- Sampling support (configurable sample rate)
- Structured context data
- Error object serialization

```typescript
// Development output
🔍 [DEBUG] CSRF token loaded from sessionStorage

// Production output (JSON)
{"level":"debug","message":"CSRF token loaded from sessionStorage","timestamp":"2026-01-05T..."}
```

---

## Build and Deployment

### 1. Build Process

```bash
# Install dependencies
npm install

# Generate API types from OpenAPI spec
npm run generate:api

# Type checking
tsc --noEmit

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e

# Build for production
npm run build
# Outputs:
# - .next/          (Next.js build)
# - public/sw.js    (Service Worker, production only)
```

### 2. Environment Variables

**Required**:
```bash
NEXT_PUBLIC_API_URL=https://api.catchup-feed.com
NEXT_PUBLIC_APP_URL=https://pulse.catchup-feed.com
```

**Optional**:
```bash
# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_ENV=production

# Feature flags
NEXT_PUBLIC_FEATURE_PWA=true
NEXT_PUBLIC_FEATURE_DARK_MODE=true
NEXT_PUBLIC_FEATURE_AI_SUMMARY=false
NEXT_PUBLIC_FEATURE_TOKEN_REFRESH=true

# Observability
NEXT_PUBLIC_ENABLE_METRICS=true
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1

# Authentication
NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD=300  # 5 minutes
NEXT_PUBLIC_TOKEN_GRACE_PERIOD=60        # 60 seconds
```

### 3. Deployment Targets

**Primary**: Vercel (optimized for Next.js)
**Alternative**: Docker + Node.js runtime

**Vercel Configuration**:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 4. Static Asset Optimization

**Images**:
- Next.js Image Optimization (automatic)
- WebP format support
- Lazy loading by default
- Responsive image srcsets

**Fonts**:
- Google Fonts with self-hosting (Vercel)
- Font subsetting
- Preconnect hints

**Code Splitting**:
- Automatic route-based splitting
- Dynamic imports for large components
- Shared chunks optimization

---

## Performance Optimizations

### 1. Code Splitting

**Route-based** (automatic):
```
chunks/
├── app/(protected)/dashboard/page.js
├── app/(protected)/articles/page.js
├── app/(auth)/login/page.js
└── shared-components.js
```

**Component-based** (dynamic):
```typescript
// Lazy load heavy components
const ArticleChart = dynamic(() => import('@/components/ArticleChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 2. Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Opens interactive visualizations:
# - Client bundle
# - Server bundle
# - Edge runtime bundle
```

**Current Bundle Sizes** (production):
- Client JS: ~150KB (gzipped)
- CSS: ~20KB (gzipped)
- First Load JS: ~85KB

### 3. Performance Monitoring

**Metrics Tracked**:
- **First Contentful Paint (FCP)**: < 1.8s target
- **Largest Contentful Paint (LCP)**: < 2.5s target
- **Time to Interactive (TTI)**: < 3.8s target
- **Cumulative Layout Shift (CLS)**: < 0.1 target

**Implementation**:
```typescript
// Performance marks in API client
performance.mark('api-get-articles-start');
const response = await fetch(...);
performance.mark('api-get-articles-end');
performance.measure('API: getArticles', 'api-get-articles-start', 'api-get-articles-end');
```

### 4. React Optimization Techniques

**Memoization**:
```typescript
// Expensive computations
const sortedArticles = useMemo(
  () => articles.sort((a, b) => ...),
  [articles]
);

// Callback stability
const handleClick = useCallback(
  () => doSomething(id),
  [id]
);
```

**Virtualization** (for long lists):
```typescript
// Virtual scrolling for 1000+ items
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 5. Network Optimizations

**HTTP/2 Server Push**:
- Automatic for Vercel deployment
- Preload critical resources

**Resource Hints**:
```html
<link rel="dns-prefetch" href="https://api.catchup-feed.com">
<link rel="preconnect" href="https://api.catchup-feed.com">
```

**Compression**:
- Gzip for text assets
- Brotli for supported browsers

### 6. Database Query Optimization

**Pagination**:
```typescript
// Always paginate large datasets
const { articles, pagination } = await getArticles({
  page: 1,
  limit: 20,
});
```

**Selective Field Loading**:
```typescript
// Backend should only return required fields
// Avoid over-fetching data
```

---

## Appendix

### A. Directory Structure

```
catchup-feed-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (protected)/        # Protected pages
│   │   ├── (legal)/            # Legal pages
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # Radix UI components
│   │   ├── auth/               # Auth components
│   │   ├── articles/           # Article components
│   │   ├── sources/            # Source components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── search/             # Search components
│   │   ├── common/             # Shared components
│   │   └── layout/             # Layout components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core libraries
│   │   ├── api/                # API client & endpoints
│   │   ├── auth/               # Authentication utilities
│   │   ├── security/           # CSRF protection
│   │   ├── observability/      # Metrics & tracing
│   │   └── features/           # Feature flags
│   ├── config/                 # Configuration files
│   ├── providers/              # Context providers
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   ├── proxy.ts                # Next.js 16 proxy (renamed from middleware)
│   └── sw.ts                   # Serwist service worker
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker (generated)
│   └── icons/                  # App icons
├── docs/                       # Documentation
├── tests/                      # E2E tests (Playwright)
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind configuration
├── vitest.config.ts            # Vitest configuration
└── package.json                # Dependencies & scripts
```

### B. Key Design Decisions

1. **Why Next.js 16 App Router?**
   - Modern React Server Components
   - Turbopack for faster development builds (5-10x faster Fast Refresh)
   - Better performance (streaming, partial hydration)
   - Improved developer experience
   - Built-in proxy (renamed from middleware) for auth/CSRF
   - Security patches for CVE-2025-55184 and CVE-2025-55183

2. **Why TanStack Query instead of SWR?**
   - More powerful caching strategies
   - Better TypeScript support
   - Advanced features (optimistic updates, infinite queries)
   - Active maintenance and community

3. **Why Singleton Pattern for TokenManager?**
   - Consistent token state across app
   - Multi-tab synchronization
   - Prevent race conditions during refresh
   - Centralized storage logic

4. **Why Double Submit Cookie for CSRF?**
   - No server-side session storage required
   - Works with JWT authentication
   - Protection against CSRF attacks
   - Simple to implement and validate

5. **Why Edge Runtime for Proxy?**
   - Low latency (runs closer to user)
   - Fast JWT validation
   - No cold starts
   - Cost-effective for auth checks

6. **Why Serwist instead of next-pwa?**
   - Active maintenance (next-pwa unmaintained for ~1 year)
   - Better TypeScript support
   - Modern Workbox-compatible API
   - Smaller bundle size and better performance
   - Community-driven development (50+ contributors)
   - Turbopack compatibility roadmap (GitHub issue #54)

### C. Key Design Patterns

#### Reusable Form Components

**SourceForm Pattern**: Single component handles both create and edit modes

```typescript
// Shared component with mode prop
<SourceForm
  mode="create" | "edit"
  initialData={mode === 'edit' ? source : undefined}
  onSubmit={handleSubmit}
  isLoading={isPending}
  error={error}
  onCancel={onClose}
/>
```

**Benefits**:
- Reduces code duplication (single validation logic)
- Consistent user experience across create/edit
- Easier maintenance (one component to update)
- Testability (test both modes with same component)

**Implementation Details**:
- Mode-based button labels ("Add Source" vs "Save Changes")
- Optional initialData for pre-population
- Client-side validation with real-time feedback
- Trimming and sanitization before submission

#### Optimistic UI Updates

**Pattern**: Update UI immediately, rollback on error

**Use Cases**:
- Source editing (useUpdateSource)
- Source toggle (useUpdateSourceActive)

**Implementation**:
1. Cancel outgoing queries (prevent race conditions)
2. Snapshot current cache state
3. Optimistically update cache
4. Make API request
5. On success: Invalidate cache to refresh from server
6. On error: Rollback to snapshot

**Benefits**:
- Instant feedback (no loading delay)
- Improved perceived performance
- Automatic error recovery

### D. Future Improvements

1. **Performance**:
   - Implement route preloading
   - Add image optimization pipeline
   - Optimize bundle splitting further

2. **Developer Experience**:
   - Add Storybook for all components
   - Improve test coverage (target: 80%+)
   - Add visual regression testing

3. **Features**:
   - WebSocket for real-time updates
   - Offline mode (service worker improvements)
   - Push notifications

4. **Infrastructure**:
   - Add GraphQL layer (optional)
   - Implement CDN for static assets
   - Add rate limiting on client side

---

**Document Maintained By**: Development Team
**Review Cycle**: Quarterly or on major architectural changes
**Questions?**: See [repository-structure.md](./repository-structure.md) for file organization details.
