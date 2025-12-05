# Design Document - Initial Setup, Authentication & Dashboard

**Feature ID**: FEAT-001
**Created**: 2025-11-29
**Last Updated**: 2025-11-29
**Designer**: designer agent
**Iteration**: 2 (Extensibility & Observability improvements)

---

## Metadata

```yaml
design_metadata:
  feature_id: "FEAT-001"
  feature_name: "Initial Setup, Authentication & Dashboard"
  created: "2025-11-29"
  updated: "2025-11-29"
  iteration: 2
  components:
    - Project scaffold with Next.js 15
    - JWT authentication system
    - Dashboard with statistics
```

---

## 1. Overview

This design document covers the foundational components of the Catchup Feed Web application, including:

1. **Project Initial Setup**: Complete Next.js 15 environment with TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, and Vitest
2. **Authentication System**: JWT-based authentication with login page, token management, and protected route guards
3. **Dashboard**: Statistics display and recent articles list for authenticated users

### Goals and Objectives

- Establish a robust, scalable frontend architecture following modern React/Next.js best practices
- Implement secure authentication flow that integrates with the catchup-feed backend API
- Create an intuitive dashboard interface for viewing article statistics and recent content
- Ensure type safety throughout the application using TypeScript and OpenAPI-generated types
- Maintain excellent developer experience with proper tooling (linting, testing, formatting)

### Success Criteria

- ✅ Development environment runs successfully with `npm run dev`
- ✅ All tests pass with `npm test`
- ✅ Users can log in with valid credentials and receive JWT token
- ✅ Unauthenticated users are redirected to login page
- ✅ Dashboard displays accurate statistics from backend API
- ✅ Code passes TypeScript strict mode checks and ESLint validation
- ✅ Test coverage reaches >80% for critical paths (auth, API client)

---

## 2. Requirements Analysis

### Functional Requirements

#### Project Setup (SETUP)
- **SETUP-01**: Initialize Next.js 15 project with App Router
- **SETUP-02**: Configure TypeScript with strict mode enabled
- **SETUP-03**: Setup Tailwind CSS 4.x with configuration
- **SETUP-04**: Install and configure shadcn/ui component library
- **SETUP-05**: Setup TanStack Query v5 for data fetching
- **SETUP-06**: Configure Vitest and React Testing Library for unit tests
- **SETUP-07**: Setup ESLint and Prettier for code quality
- **SETUP-08**: Generate TypeScript types from backend OpenAPI specification

#### Authentication (AUTH)
- **AUTH-01**: Users must log in to access protected content (from requirements)
- **AUTH-02**: Implement JWT token acquisition from `/auth/token` endpoint (from requirements)
- **AUTH-03**: Store JWT token securely in localStorage (from requirements)
- **AUTH-04**: Redirect unauthenticated users to login page (from requirements)
- **AUTH-05**: Implement logout functionality to clear token (from requirements)
- **AUTH-06**: Add automatic token inclusion in API requests via Authorization header
- **AUTH-07**: Handle authentication errors gracefully with user feedback

#### Dashboard (DASH)
- **DASH-01**: Display statistics dashboard for authenticated users (from requirements)
- **DASH-02**: Show total article count
- **DASH-03**: Show total source count
- **DASH-04**: Display recent articles list (latest 10 articles)
- **DASH-05**: Provide navigation to article detail pages
- **DASH-06**: Show loading states during data fetching
- **DASH-07**: Handle API errors with user-friendly messages

### Non-Functional Requirements

#### Performance (PERF)
- **PERF-01**: Initial page load (LCP) < 2.5s (from requirements)
- **PERF-02**: Time to Interactive (TTI) < 3.5s (from requirements)
- **PERF-03**: API response caching with 60s stale time (from requirements)
- **PERF-04**: Code splitting to minimize initial bundle size
- **PERF-05**: Image optimization using Next.js Image component

#### Security (SEC)
- **SEC-01**: All authenticated API calls include Authorization header (from requirements)
- **SEC-02**: No sensitive data in URL parameters (from requirements)
- **SEC-03**: XSS protection via React's default escaping (from requirements)
- **SEC-04**: JWT token validation before making authenticated requests
- **SEC-05**: Secure token storage with proper error handling
- **SEC-06**: HTTPS-only in production environment

#### Accessibility (A11Y)
- **A11Y-01**: WCAG 2.1 AA compliance (from requirements)
- **A11Y-02**: Keyboard navigation support (from requirements)
- **A11Y-03**: Screen reader compatibility (from requirements)
- **A11Y-04**: Proper ARIA labels for interactive elements
- **A11Y-05**: Focus management for route transitions

#### Developer Experience (DX)
- **DX-01**: TypeScript strict mode for type safety
- **DX-02**: Hot module replacement for fast development
- **DX-03**: Comprehensive error messages during development
- **DX-04**: Automated code formatting with Prettier
- **DX-05**: Pre-commit hooks for code quality checks

### Constraints

- **CONST-01**: Must use Next.js 15 App Router (no Pages Router)
- **CONST-02**: Backend API is already implemented and cannot be modified
- **CONST-03**: API contract defined by OpenAPI specification from catchup-feed
- **CONST-04**: No server-side session management (JWT only)
- **CONST-05**: Frontend must work with existing backend on localhost:8080
- **CONST-06**: No user registration UI (admin creates accounts via API/CLI)

---

## 3. Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │            Next.js 15 App (Client)                      │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │     │
│  │  │ Public Pages │  │ Auth Pages   │  │ Protected   │  │     │
│  │  │ - Landing    │  │ - Login      │  │ Pages       │  │     │
│  │  │              │  │              │  │ - Dashboard │  │     │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │     │
│  │                                                         │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │         React Query (TanStack Query)             │  │     │
│  │  │  - API state management                          │  │     │
│  │  │  - Caching & revalidation                        │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  │                                                         │     │
│  │  ┌──────────────────────────────────────────────────┐  │     │
│  │  │            API Client Layer                      │  │     │
│  │  │  - Type-safe API client (openapi-typescript)    │  │     │
│  │  │  - JWT token injection                           │  │     │
│  │  │  - Error handling                                │  │     │
│  │  └──────────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │ Authorization: Bearer {JWT}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Catchup Feed Backend API                       │
│                        (Go - Port 8080)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /auth/token  │  │ /articles    │  │ /sources     │          │
│  │ (POST)       │  │ (GET)        │  │ (GET)        │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Layer 1: Application Shell
- **App Layout** (`src/app/layout.tsx`)
  - Root layout with providers (QueryClient, Theme)
  - Global styles and fonts
  - Metadata configuration

#### Layer 2: Route Groups
- **Public Routes** (`src/app/(public)/`)
  - Landing page (`page.tsx`)
  - Accessible without authentication

- **Auth Routes** (`src/app/(auth)/`)
  - Login page (`login/page.tsx`)
  - Password reset (future)

- **Protected Routes** (`src/app/(protected)/`)
  - Dashboard (`dashboard/page.tsx`)
  - Articles (`articles/page.tsx`, `articles/[id]/page.tsx`)
  - Sources (`sources/page.tsx`)
  - Protected by middleware authentication check

#### Layer 3: Component Library
- **UI Components** (`src/components/ui/`)
  - shadcn/ui components (Button, Card, Input, etc.)
  - Reusable, accessible primitives from Radix UI

- **Feature Components** (`src/components/`)
  - `auth/LoginForm.tsx` - Login form with validation
  - `dashboard/StatisticsCard.tsx` - Statistics display
  - `dashboard/RecentArticlesList.tsx` - Article list component
  - `layout/Header.tsx` - Navigation header
  - `layout/Footer.tsx` - Page footer
  - `common/LoadingSpinner.tsx` - Loading indicator
  - `common/ErrorMessage.tsx` - Error display

#### Layer 4: Data Access Layer
- **API Client** (`src/lib/api/`)
  - `client.ts` - Base fetch wrapper with JWT injection
  - `types.ts` - OpenAPI-generated TypeScript types
  - `endpoints/auth.ts` - Authentication endpoints
  - `endpoints/articles.ts` - Articles endpoints
  - `endpoints/sources.ts` - Sources endpoints

- **React Query Hooks** (`src/hooks/`)
  - `useAuth.ts` - Authentication state and methods
  - `useArticles.ts` - Articles data fetching
  - `useSources.ts` - Sources data fetching
  - `useDashboardStats.ts` - Dashboard statistics

#### Layer 5: Utilities & Configuration
- **Auth Utilities** (`src/lib/auth/`)
  - `token.ts` - JWT token storage/retrieval
  - `session.ts` - Session validation

- **Providers** (`src/providers/`)
  - `QueryProvider.tsx` - TanStack Query setup
  - `ThemeProvider.tsx` - Dark mode support (future)

### Data Flow

#### Authentication Flow
```
1. User visits protected page (e.g., /dashboard)
   ↓
2. Middleware checks for JWT in localStorage
   ↓
3a. No token → Redirect to /login
   ↓
4. User submits login form
   ↓
5. POST /auth/token with credentials
   ↓
6. Backend validates and returns JWT
   ↓
7. Store token in localStorage
   ↓
8. Redirect to /dashboard

3b. Token exists → Allow access
   ↓
9. Render protected page
```

#### Dashboard Data Flow
```
1. Dashboard page renders
   ↓
2. useDashboardStats hook initializes
   ↓
3. React Query checks cache
   ↓
4a. Cache hit (< 60s old) → Return cached data

4b. Cache miss/stale → Fetch from API
   ↓
5. API client adds Authorization: Bearer {token}
   ↓
6. GET /articles and GET /sources in parallel
   ↓
7. Backend returns data
   ↓
8. React Query updates cache
   ↓
9. Component re-renders with data
```

---

## 4. Data Model

### Client-Side State Management

#### Authentication State
```typescript
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null; // Future: user profile
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface User {
  id: string;
  email: string;
  // Extended in future iterations
}
```

#### Dashboard State
```typescript
interface DashboardStats {
  totalArticles: number;
  totalSources: number;
  recentArticles: Article[];
  lastUpdated: Date;
}

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  summary?: string; // AI-generated summary
  createdAt: string;
  updatedAt: string;
}

interface Source {
  id: string;
  name: string;
  url: string;
  feedType: 'rss' | 'atom';
  isActive: boolean;
  articleCount: number;
}
```

### API Response Types (OpenAPI-Generated)

These types will be automatically generated from the backend's OpenAPI specification using `openapi-typescript`:

```typescript
// Generated from openapi-typescript
import type { paths } from './types/api';

// Auth token response
type TokenResponse = paths['/auth/token']['post']['responses']['200']['content']['application/json'];

// Articles list response
type ArticlesResponse = paths['/articles']['get']['responses']['200']['content']['application/json'];

// Article detail response
type ArticleResponse = paths['/articles/{id}']['get']['responses']['200']['content']['application/json'];

// Sources list response
type SourcesResponse = paths['/sources']['get']['responses']['200']['content']['application/json'];
```

### LocalStorage Schema

```typescript
// Key: 'catchup_feed_auth_token'
// Value: JWT string
// Example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

interface LocalStorageKeys {
  AUTH_TOKEN: 'catchup_feed_auth_token';
  // Future: preferences, theme, etc.
}
```

---

## 5. API Design

### Frontend API Client Architecture

#### Base Client Configuration
```typescript
// src/lib/api/client.ts

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      timeout: 30000,
      ...config
    };
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers
    };

    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }
}
```

#### Authentication Endpoints

##### POST /auth/token - Login
```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
}

// Response
interface LoginResponse {
  token: string;
  expiresAt: string; // ISO 8601 timestamp
}

// Usage
async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.request<LoginResponse>('/auth/token', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

// Error Responses
// 401 Unauthorized: Invalid credentials
// 400 Bad Request: Missing email/password
// 500 Internal Server Error: Backend error
```

#### Articles Endpoints

##### GET /articles - List Articles
```typescript
// Query Parameters
interface ArticlesQuery {
  page?: number;
  limit?: number;
  sourceId?: string; // Filter by source
}

// Response
interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Usage
async function getArticles(query?: ArticlesQuery): Promise<ArticlesResponse> {
  const params = new URLSearchParams(query as any);
  return apiClient.request<ArticlesResponse>(`/articles?${params}`);
}

// Headers Required
// Authorization: Bearer {token}
```

##### GET /articles/{id} - Get Article Detail
```typescript
// Path Parameters
interface ArticleParams {
  id: string;
}

// Response
interface ArticleResponse {
  article: Article;
}

// Usage
async function getArticle(id: string): Promise<ArticleResponse> {
  return apiClient.request<ArticleResponse>(`/articles/${id}`);
}

// Headers Required
// Authorization: Bearer {token}

// Error Responses
// 404 Not Found: Article doesn't exist
// 401 Unauthorized: Invalid/missing token
```

#### Sources Endpoints

##### GET /sources - List Sources
```typescript
// Response
interface SourcesResponse {
  sources: Source[];
}

// Usage
async function getSources(): Promise<SourcesResponse> {
  return apiClient.request<SourcesResponse>('/sources');
}

// Headers Required
// Authorization: Bearer {token}
```

#### Error Handling

```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling in components
try {
  const data = await getArticles();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Token expired or invalid
      logout();
      router.push('/login');
    } else if (error.status >= 500) {
      // Server error
      showErrorToast('Server error. Please try again later.');
    }
  }
}
```

### React Query Integration

```typescript
// src/hooks/useArticles.ts

export function useArticles(query?: ArticlesQuery) {
  return useQuery({
    queryKey: ['articles', query],
    queryFn: () => getArticles(query),
    staleTime: 60000, // 60s stale time (from requirements)
    gcTime: 300000, // 5min garbage collection
    retry: 1,
    retryDelay: 1000
  });
}

// src/hooks/useDashboardStats.ts

export function useDashboardStats() {
  const articlesQuery = useQuery({
    queryKey: ['articles', { limit: 10 }],
    queryFn: () => getArticles({ limit: 10 })
  });

  const sourcesQuery = useQuery({
    queryKey: ['sources'],
    queryFn: () => getSources()
  });

  return {
    stats: {
      totalArticles: articlesQuery.data?.pagination.total ?? 0,
      totalSources: sourcesQuery.data?.sources.length ?? 0,
      recentArticles: articlesQuery.data?.articles ?? []
    },
    isLoading: articlesQuery.isLoading || sourcesQuery.isLoading,
    error: articlesQuery.error || sourcesQuery.error
  };
}
```

---

## 6. Security Considerations

### Threat Model

#### Identified Threats

1. **T-01: Token Theft**
   - Attacker steals JWT from localStorage via XSS
   - Impact: Unauthorized access to user account
   - Likelihood: Medium (if XSS vulnerability exists)

2. **T-02: Session Hijacking**
   - Attacker intercepts JWT during transmission
   - Impact: Account takeover
   - Likelihood: Low (HTTPS mitigates)

3. **T-03: Brute Force Login**
   - Attacker attempts multiple login credentials
   - Impact: Unauthorized access
   - Likelihood: Medium (backend rate limiting required)

4. **T-04: XSS Injection**
   - Attacker injects malicious scripts via article content
   - Impact: Token theft, malicious actions
   - Likelihood: Low (React escapes by default)

5. **T-05: CSRF Attacks**
   - Attacker tricks user into making unwanted requests
   - Impact: Unauthorized actions
   - Likelihood: Low (stateless JWT, no cookies yet)

### Security Controls

#### SC-01: JWT Storage & Handling
```typescript
// Secure token storage
const AUTH_TOKEN_KEY = 'catchup_feed_auth_token';

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store auth token:', error);
    // Fallback: in-memory storage (session-only)
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
}
```

**Mitigation**:
- Store token in localStorage (T-01 partial mitigation)
- Clear token on logout
- Future: Consider httpOnly cookies for enhanced security

#### SC-02: HTTPS Enforcement
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

**Mitigation**:
- Force HTTPS in production (T-02 mitigation)
- HSTS header prevents protocol downgrade

#### SC-03: Content Security Policy
```typescript
// next.config.js - CSP headers
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL};
  frame-ancestors 'none';
`;

headers: [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
]
```

**Mitigation**:
- Restrict script sources (T-04 mitigation)
- Prevent clickjacking with frame-ancestors

#### SC-04: XSS Prevention
```typescript
// React's default escaping handles most cases
// For rendering HTML content (article descriptions):

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}

// Usage in component
<div dangerouslySetInnerHTML={{
  __html: sanitizeHTML(article.description)
}} />
```

**Mitigation**:
- Sanitize user-generated content (T-04 mitigation)
- Whitelist allowed HTML tags and attributes

#### SC-05: Authentication State Validation
```typescript
// src/middleware.ts - Next.js middleware
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/articles') ||
                          request.nextUrl.pathname.startsWith('/sources');

  // Redirect to login if accessing protected page without token
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing login with valid token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

**Mitigation**:
- Server-side route protection (T-01, T-05 mitigation)
- Prevent unauthorized access to protected pages

#### SC-06: API Request Validation
```typescript
// Validate token before each API request
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  // For protected endpoints, ensure token exists
  if (!endpoint.includes('/auth/token') && !token) {
    throw new ApiError(401, 'No authentication token found');
  }

  // Add token to headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers
  };

  // Make request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle 401 - token expired/invalid
    if (response.status === 401) {
      clearAuthToken();
      window.location.href = '/login';
      throw new ApiError(401, 'Authentication failed');
    }

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
```

**Mitigation**:
- Validate token existence before requests
- Handle 401 responses by clearing token and redirecting
- Request timeout prevents hanging requests

### Data Protection Measures

#### DP-01: Sensitive Data in URLs
- **Never** pass JWT tokens in URL query parameters
- **Never** pass passwords in GET requests
- Use POST body for credentials
- Use Authorization header for tokens

#### DP-02: Error Message Sanitization
```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Don't expose backend stack traces
    if (error.status >= 500) {
      return 'An unexpected error occurred. Please try again later.';
    }

    // Sanitize validation errors
    if (error.status === 400) {
      return 'Invalid request. Please check your input.';
    }

    // Safe to show 401/403 errors
    if (error.status === 401) {
      return 'Authentication failed. Please log in again.';
    }

    if (error.status === 403) {
      return 'You do not have permission to access this resource.';
    }
  }

  return 'An error occurred. Please try again.';
}
```

#### DP-03: Token Expiration Handling
```typescript
// Decode JWT to check expiration (without verification)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiresAt;
  } catch {
    return true; // Invalid token format
  }
}

// Check token before API calls
export function useAuth() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getAuthToken();

    if (token && isTokenExpired(token)) {
      clearAuthToken();
      queryClient.clear(); // Clear cached data
      router.push('/login');
    }
  }, []);
}
```

---

## 6.5. Extensibility Architecture

### Provider Abstractions

#### AuthProvider Interface
```typescript
// src/lib/auth/types.ts

/**
 * AuthProvider interface enables swappable authentication strategies.
 * Supports JWT (current), OAuth, SAML, and MFA (future).
 */
export interface AuthProvider {
  // Core authentication
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;

  // Token management
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  isTokenValid(): boolean;

  // Session state
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;

  // Future: OAuth flows
  initiateOAuth?(provider: OAuthProvider): Promise<void>;
  handleOAuthCallback?(code: string): Promise<AuthResult>;

  // Future: MFA
  initiateMFA?(): Promise<MFAChallenge>;
  verifyMFA?(code: string): Promise<AuthResult>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  requiresMFA?: boolean;
}

export type OAuthProvider = 'google' | 'github' | 'microsoft';

export interface MFAChallenge {
  challengeId: string;
  type: 'totp' | 'sms' | 'email';
}
```

#### JWT AuthProvider Implementation
```typescript
// src/lib/auth/providers/jwt-provider.ts

import { AuthProvider, LoginCredentials, AuthResult } from '../types';
import { storageProvider } from '../storage';

export class JWTAuthProvider implements AuthProvider {
  private readonly tokenKey = 'catchup_feed_auth_token';

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await fetch(`${config.apiUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        return { success: false, error: 'Invalid credentials' };
      }

      const { token, user } = await response.json();
      this.setToken(token);

      return { success: true, token, user };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  getToken(): string | null {
    return storageProvider.get(this.tokenKey);
  }

  setToken(token: string): void {
    storageProvider.set(this.tokenKey, token);
  }

  clearToken(): void {
    storageProvider.remove(this.tokenKey);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token || !this.isTokenValid()) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  }
}
```

#### StorageProvider Interface
```typescript
// src/lib/auth/storage/types.ts

/**
 * StorageProvider interface abstracts storage mechanism.
 * Enables migration from localStorage to httpOnly cookies.
 */
export interface StorageProvider {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

// Current implementation: localStorage
export class LocalStorageProvider implements StorageProvider {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage write failed:', error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove failed:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear failed:', error);
    }
  }
}

// Future: httpOnly cookie implementation
export class CookieStorageProvider implements StorageProvider {
  // Will be implemented when migrating to cookies
  // Uses Next.js server actions for cookie management
  get(key: string): string | null { return null; }
  set(key: string, value: string): void {}
  remove(key: string): void {}
  clear(): void {}
}
```

### Centralized Configuration System

```typescript
// src/lib/config/app.config.ts

/**
 * Centralized configuration with environment-aware defaults.
 * All configurable values should be defined here.
 */
export interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  // Authentication Configuration
  auth: {
    tokenKey: string;
    tokenRefreshThreshold: number; // seconds before expiry to refresh
    sessionTimeout: number; // milliseconds
  };

  // Caching Configuration
  cache: {
    staleTime: number;
    gcTime: number;
    refetchOnWindowFocus: boolean;
  };

  // Feature Flags
  features: {
    enableDarkMode: boolean;
    enableBookmarks: boolean;
    enableRealTimeUpdates: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };

  // Observability Configuration
  observability: {
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
    enableTracing: boolean;
  };
}

const defaultConfig: AppConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  auth: {
    tokenKey: 'catchup_feed_auth_token',
    tokenRefreshThreshold: 300, // 5 minutes
    sessionTimeout: 3600000, // 1 hour
  },
  cache: {
    staleTime: 60000, // 60 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  },
  features: {
    enableDarkMode: false,
    enableBookmarks: false,
    enableRealTimeUpdates: false,
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableErrorReporting: process.env.NODE_ENV === 'production',
  },
  observability: {
    enableLogging: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableMetrics: true,
    enableTracing: process.env.NODE_ENV === 'production',
  },
};

// Export singleton config instance
export const config: AppConfig = {
  ...defaultConfig,
  // Allow runtime overrides via environment variables
  api: {
    ...defaultConfig.api,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || defaultConfig.api.timeout,
  },
};

// Type-safe config accessor
export function getConfig<K extends keyof AppConfig>(section: K): AppConfig[K] {
  return config[section];
}
```

### Consolidated Auth Module

```typescript
// src/lib/auth/index.ts

/**
 * Consolidated authentication module.
 * Single entry point for all auth-related functionality.
 */
import { JWTAuthProvider } from './providers/jwt-provider';
import { LocalStorageProvider } from './storage/local-storage';
import { config } from '../config/app.config';

// Initialize providers based on configuration
export const storageProvider = new LocalStorageProvider();
export const authProvider = new JWTAuthProvider();

// Re-export types
export type { AuthProvider, StorageProvider, LoginCredentials, AuthResult } from './types';

// Convenience functions
export const login = (credentials: LoginCredentials) => authProvider.login(credentials);
export const logout = () => authProvider.logout();
export const getToken = () => authProvider.getToken();
export const isAuthenticated = () => authProvider.isAuthenticated();
export const getCurrentUser = () => authProvider.getCurrentUser();
```

---

## 6.6. Observability Architecture

### Structured Logging Strategy

```typescript
// src/lib/observability/logger.ts

/**
 * Structured logging with context propagation.
 * Supports multiple log levels and structured metadata.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private level: LogLevel;
  private context: LogContext = {};

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // Development: pretty print to console
    if (process.env.NODE_ENV === 'development') {
      const color = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      }[entry.level];

      console.log(`${color}[${entry.level.toUpperCase()}]\x1b[0m`, entry.message, entry.context);
      if (entry.error) {
        console.error(entry.error);
      }
      return;
    }

    // Production: structured JSON output
    const output = JSON.stringify(entry);

    switch (entry.level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }

    // Future: Send to log aggregation service (e.g., CloudWatch, Datadog)
    // this.sendToLogService(entry);
  }

  // Set persistent context (e.g., userId, sessionId)
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  // Create child logger with additional context
  child(context: LogContext): Logger {
    const child = new Logger(this.level);
    child.context = { ...this.context, ...context };
    return child;
  }

  debug(message: string, context?: LogContext): void {
    this.log(this.formatEntry('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.log(this.formatEntry('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.log(this.formatEntry('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(this.formatEntry('error', message, context, error));
  }
}

// Export singleton logger instance
export const logger = new Logger(
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info'
);
```

### Distributed Tracing

```typescript
// src/lib/observability/tracing.ts

/**
 * Distributed tracing with X-Request-ID correlation.
 * Enables request tracking across frontend and backend.
 */

import { v4 as uuidv4 } from 'uuid';

export interface TraceContext {
  requestId: string;
  spanId: string;
  parentSpanId?: string;
  traceId: string;
  startTime: number;
}

class TracingService {
  private currentTrace: TraceContext | null = null;

  // Generate a new trace context
  startTrace(): TraceContext {
    const now = Date.now();
    this.currentTrace = {
      requestId: uuidv4(),
      spanId: uuidv4().slice(0, 16),
      traceId: uuidv4(),
      startTime: now,
    };
    return this.currentTrace;
  }

  // Create a child span within current trace
  startSpan(name: string): TraceContext {
    if (!this.currentTrace) {
      return this.startTrace();
    }

    return {
      requestId: this.currentTrace.requestId,
      spanId: uuidv4().slice(0, 16),
      parentSpanId: this.currentTrace.spanId,
      traceId: this.currentTrace.traceId,
      startTime: Date.now(),
    };
  }

  // Get current trace context
  getCurrentTrace(): TraceContext | null {
    return this.currentTrace;
  }

  // Get headers to propagate trace context
  getTraceHeaders(): Record<string, string> {
    if (!this.currentTrace) {
      this.startTrace();
    }

    return {
      'X-Request-ID': this.currentTrace!.requestId,
      'X-Trace-ID': this.currentTrace!.traceId,
      'X-Span-ID': this.currentTrace!.spanId,
    };
  }

  // End current trace and calculate duration
  endTrace(): { duration: number; context: TraceContext } | null {
    if (!this.currentTrace) return null;

    const duration = Date.now() - this.currentTrace.startTime;
    const context = this.currentTrace;
    this.currentTrace = null;

    return { duration, context };
  }
}

export const tracing = new TracingService();

// Middleware to inject trace context into API client
export function withTracing<T>(
  fn: (headers: Record<string, string>) => Promise<T>
): Promise<T> {
  const trace = tracing.startTrace();
  const headers = tracing.getTraceHeaders();

  return fn(headers).finally(() => {
    const result = tracing.endTrace();
    if (result) {
      logger.debug('API request completed', {
        requestId: result.context.requestId,
        duration: result.duration,
      });
    }
  });
}
```

### Operational Metrics

```typescript
// src/lib/observability/metrics.ts

/**
 * Frontend metrics collection.
 * Includes Web Vitals and custom application metrics.
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

export interface Metric {
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: number;
}

class MetricsService {
  private metrics: Metric[] = [];
  private flushInterval: number = 30000; // 30 seconds

  constructor() {
    // Collect Web Vitals automatically
    if (typeof window !== 'undefined') {
      this.initWebVitals();
      this.startPeriodicFlush();
    }
  }

  private initWebVitals(): void {
    onCLS((metric) => this.record('web_vital_cls', metric.value, 'score'));
    onFCP((metric) => this.record('web_vital_fcp', metric.value, 'ms'));
    onFID((metric) => this.record('web_vital_fid', metric.value, 'ms'));
    onLCP((metric) => this.record('web_vital_lcp', metric.value, 'ms'));
    onTTFB((metric) => this.record('web_vital_ttfb', metric.value, 'ms'));
  }

  private startPeriodicFlush(): void {
    setInterval(() => this.flush(), this.flushInterval);
  }

  // Record a metric
  record(name: string, value: number, unit: string, tags: Record<string, string> = {}): void {
    this.metrics.push({
      name,
      value,
      unit,
      tags: {
        ...tags,
        environment: process.env.NODE_ENV || 'development',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      },
      timestamp: Date.now(),
    });
  }

  // Record API call metrics
  recordApiCall(endpoint: string, duration: number, status: number): void {
    this.record('api_call_duration', duration, 'ms', {
      endpoint,
      status: String(status),
      success: String(status >= 200 && status < 300),
    });
  }

  // Record error count
  recordError(type: string, component?: string): void {
    this.record('error_count', 1, 'count', {
      type,
      component: component || 'unknown',
    });
  }

  // Record user action
  recordAction(action: string, component: string): void {
    this.record('user_action', 1, 'count', {
      action,
      component,
    });
  }

  // Flush metrics to backend/monitoring service
  private flush(): void {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Metrics]', metricsToSend);
      return;
    }

    // Production: Send to monitoring service
    // Future: Implement actual metric shipping
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify(metricsToSend),
    // });
  }
}

export const metrics = new MetricsService();
```

### Frontend Health Check & Diagnostics

```typescript
// src/lib/observability/health.ts

/**
 * Frontend health check and diagnostics.
 * Provides runtime health status and diagnostic information.
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheck[];
  diagnostics: Diagnostics;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail';
  message?: string;
  duration?: number;
}

export interface Diagnostics {
  version: string;
  environment: string;
  userAgent: string;
  localStorage: boolean;
  cookiesEnabled: boolean;
  onlineStatus: boolean;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

class HealthService {
  private readonly version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

  async checkHealth(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];

    // Check API connectivity
    checks.push(await this.checkApiHealth());

    // Check localStorage availability
    checks.push(this.checkStorage());

    // Check authentication state consistency
    checks.push(this.checkAuthState());

    const hasFailure = checks.some((c) => c.status === 'fail');
    const allPassed = checks.every((c) => c.status === 'pass');

    return {
      status: allPassed ? 'healthy' : hasFailure ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      diagnostics: this.getDiagnostics(),
    };
  }

  private async checkApiHealth(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const response = await fetch(`${config.api.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      return {
        name: 'api_connectivity',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'API is reachable' : `API returned ${response.status}`,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        name: 'api_connectivity',
        status: 'fail',
        message: `API unreachable: ${(error as Error).message}`,
        duration: Date.now() - start,
      };
    }
  }

  private checkStorage(): HealthCheck {
    try {
      const testKey = '__health_check__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      return {
        name: 'local_storage',
        status: 'pass',
        message: 'localStorage is available',
      };
    } catch {
      return {
        name: 'local_storage',
        status: 'fail',
        message: 'localStorage is not available',
      };
    }
  }

  private checkAuthState(): HealthCheck {
    try {
      const token = authProvider.getToken();
      const isValid = authProvider.isTokenValid();

      if (token && !isValid) {
        return {
          name: 'auth_state',
          status: 'fail',
          message: 'Token exists but is invalid/expired',
        };
      }

      return {
        name: 'auth_state',
        status: 'pass',
        message: token ? 'Valid authentication token' : 'No authentication token',
      };
    } catch (error) {
      return {
        name: 'auth_state',
        status: 'fail',
        message: `Auth check failed: ${(error as Error).message}`,
      };
    }
  }

  private getDiagnostics(): Diagnostics {
    const diagnostics: Diagnostics = {
      version: this.version,
      environment: process.env.NODE_ENV || 'development',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      localStorage: this.isLocalStorageAvailable(),
      cookiesEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
      onlineStatus: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };

    // Add memory info if available (Chrome only)
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      diagnostics.memory = {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      };
    }

    return diagnostics;
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const health = new HealthService();

// Export health check API route handler (for Next.js API route)
export async function healthCheckHandler(): Promise<HealthStatus> {
  return health.checkHealth();
}
```

### Observability Integration

```typescript
// src/lib/observability/index.ts

/**
 * Unified observability module.
 * Single entry point for logging, metrics, tracing, and health.
 */

export { logger, type LogLevel, type LogContext, type LogEntry } from './logger';
export { metrics, type Metric } from './metrics';
export { tracing, withTracing, type TraceContext } from './tracing';
export { health, healthCheckHandler, type HealthStatus, type HealthCheck } from './health';

// Initialize observability on app startup
export function initObservability(): void {
  // Set up global error handler
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', event.error, {
        component: 'global',
        action: 'uncaught_error',
      });
      metrics.recordError('uncaught', 'global');
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', event.reason, {
        component: 'global',
        action: 'unhandled_rejection',
      });
      metrics.recordError('unhandled_rejection', 'global');
    });
  }

  logger.info('Observability initialized', {
    component: 'observability',
    action: 'init',
  });
}
```

### Updated API Client with Observability

```typescript
// src/lib/api/client.ts (updated with observability)

import { config } from '../config/app.config';
import { logger, metrics, tracing } from '../observability';
import { authProvider } from '../auth';

class ApiClient {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const trace = tracing.startTrace();
    const start = Date.now();

    const headers = {
      'Content-Type': 'application/json',
      ...tracing.getTraceHeaders(),
      ...(authProvider.getToken() && {
        'Authorization': `Bearer ${authProvider.getToken()}`
      }),
      ...options?.headers,
    };

    logger.debug('API request started', {
      requestId: trace.requestId,
      endpoint,
      method: options?.method || 'GET',
    });

    try {
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const duration = Date.now() - start;
      metrics.recordApiCall(endpoint, duration, response.status);

      logger.debug('API request completed', {
        requestId: trace.requestId,
        endpoint,
        status: response.status,
        duration,
      });

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      return response.json();
    } catch (error) {
      const duration = Date.now() - start;

      logger.error('API request failed', error as Error, {
        requestId: trace.requestId,
        endpoint,
        duration,
      });

      metrics.recordError('api_error', endpoint);
      throw error;
    } finally {
      tracing.endTrace();
    }
  }
}

export const apiClient = new ApiClient();
```

---

## 7. Error Handling

### Error Scenarios

#### ES-01: Network Errors
**Scenario**: User loses internet connection during API request

**Error Message**: "Network error. Please check your connection and try again."

**Recovery Strategy**:
```typescript
// React Query automatic retry with exponential backoff
useQuery({
  queryKey: ['articles'],
  queryFn: getArticles,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
});

// User-facing component
if (isError && error.message.includes('network')) {
  return (
    <ErrorMessage>
      <p>Network error. Please check your connection.</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </ErrorMessage>
  );
}
```

#### ES-02: Authentication Failure (401)
**Scenario**: JWT token is invalid or expired

**Error Message**: "Your session has expired. Please log in again."

**Recovery Strategy**:
```typescript
// Global error handler in API client
if (response.status === 401) {
  clearAuthToken();

  // Clear all cached queries
  queryClient.clear();

  // Redirect to login with return URL
  const returnUrl = window.location.pathname;
  router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);

  throw new ApiError(401, 'Your session has expired. Please log in again.');
}
```

#### ES-03: Server Error (500)
**Scenario**: Backend API encounters internal error

**Error Message**: "Something went wrong on our end. Please try again later."

**Recovery Strategy**:
```typescript
// Component-level error boundary
if (error?.status >= 500) {
  return (
    <ErrorMessage variant="critical">
      <h3>Server Error</h3>
      <p>We're experiencing technical difficulties. Please try again in a few minutes.</p>
      <Button onClick={() => refetch()}>Try Again</Button>
    </ErrorMessage>
  );
}
```

#### ES-04: Invalid Credentials
**Scenario**: User enters wrong email/password

**Error Message**: "Invalid email or password. Please try again."

**Recovery Strategy**:
```typescript
// Login form error handling
const loginMutation = useMutation({
  mutationFn: login,
  onError: (error: ApiError) => {
    if (error.status === 401) {
      setError('credentials', {
        type: 'manual',
        message: 'Invalid email or password. Please try again.'
      });

      // Focus email field for retry
      emailRef.current?.focus();
    }
  }
});
```

#### ES-05: Resource Not Found (404)
**Scenario**: User navigates to non-existent article

**Error Message**: "Article not found. It may have been deleted."

**Recovery Strategy**:
```typescript
// Article detail page
if (error?.status === 404) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The article you're looking for doesn't exist or has been removed.
      </p>
      <Button onClick={() => router.push('/articles')}>
        Back to Articles
      </Button>
    </div>
  );
}
```

#### ES-06: Rate Limiting (429)
**Scenario**: User makes too many requests (backend rate limiting)

**Error Message**: "Too many requests. Please wait a moment and try again."

**Recovery Strategy**:
```typescript
// API client rate limit handling
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

  throw new ApiError(
    429,
    `Too many requests. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
    { retryAfter: waitTime }
  );
}

// Component handling
if (error?.status === 429) {
  const retryAfter = (error.details as any)?.retryAfter || 60000;

  return (
    <ErrorMessage>
      <p>Too many requests. Please wait a moment.</p>
      <p className="text-sm text-muted-foreground">
        Retry in {Math.ceil(retryAfter / 1000)} seconds
      </p>
    </ErrorMessage>
  );
}
```

#### ES-07: Validation Error (400)
**Scenario**: Form submission with invalid data

**Error Message**: Specific field-level validation messages

**Recovery Strategy**:
```typescript
// React Hook Form with Zod validation
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

// Form component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
});

// Field-level error display
<Input
  {...register('email')}
  type="email"
  placeholder="Email"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-destructive">
    {errors.email.message}
  </p>
)}
```

### Global Error Boundary

```typescript
// src/app/error.tsx - Next.js error boundary
'use client';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (future)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8">
        We encountered an unexpected error. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

---

## 8. Testing Strategy

### Test Pyramid

```
         ┌──────────────────┐
         │   E2E Tests      │  10% - Critical user journeys
         │   (Playwright)   │
         └──────────────────┘
        ┌────────────────────┐
        │ Integration Tests  │   30% - Component interactions
        │ (Vitest + RTL)     │
        └────────────────────┘
      ┌──────────────────────────┐
      │     Unit Tests           │    60% - Individual functions
      │     (Vitest)             │
      └──────────────────────────┘
```

### Unit Testing Approach

#### UT-01: Utility Functions
```typescript
// src/lib/auth/token.test.ts

describe('Token utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store token in localStorage', () => {
    const token = 'test-token-123';
    setAuthToken(token);
    expect(localStorage.getItem('catchup_feed_auth_token')).toBe(token);
  });

  it('should retrieve stored token', () => {
    localStorage.setItem('catchup_feed_auth_token', 'test-token');
    expect(getAuthToken()).toBe('test-token');
  });

  it('should return null when no token exists', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('should clear token from storage', () => {
    setAuthToken('test-token');
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  it('should detect expired tokens', () => {
    const expiredToken = createMockToken({ exp: Date.now() / 1000 - 3600 });
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  it('should detect valid tokens', () => {
    const validToken = createMockToken({ exp: Date.now() / 1000 + 3600 });
    expect(isTokenExpired(validToken)).toBe(false);
  });
});
```

#### UT-02: API Client
```typescript
// src/lib/api/client.test.ts

describe('API Client', () => {
  it('should include Authorization header when token exists', async () => {
    const mockToken = 'test-token';
    setAuthToken(mockToken);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    });

    global.fetch = fetchMock;

    await apiClient.request('/articles');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`
        })
      })
    );
  });

  it('should throw ApiError on 401 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    });

    await expect(apiClient.request('/articles')).rejects.toThrow(ApiError);
  });

  it('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(apiClient.request('/articles')).rejects.toThrow('Network error');
  });
});
```

### Integration Testing Approach

#### IT-01: Login Flow
```typescript
// src/components/auth/LoginForm.test.tsx

describe('LoginForm Integration', () => {
  it('should submit credentials and store token on success', async () => {
    const mockToken = 'mock-jwt-token';

    server.use(
      http.post('/auth/token', async () => {
        return HttpResponse.json({
          token: mockToken,
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        });
      })
    );

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(getAuthToken()).toBe(mockToken);
    });
  });

  it('should display error message on invalid credentials', async () => {
    server.use(
      http.post('/auth/token', async () => {
        return HttpResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
```

#### IT-02: Dashboard Data Fetching
```typescript
// src/app/(protected)/dashboard/page.test.tsx

describe('Dashboard Page', () => {
  it('should display statistics after successful data fetch', async () => {
    const mockArticles = createMockArticles(10);
    const mockSources = createMockSources(5);

    server.use(
      http.get('/articles', () => {
        return HttpResponse.json({
          articles: mockArticles,
          pagination: { total: 100 }
        });
      }),
      http.get('/sources', () => {
        return HttpResponse.json({
          sources: mockSources
        });
      })
    );

    render(<Dashboard />);

    // Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Should show statistics after loading
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total articles
      expect(screen.getByText('5')).toBeInTheDocument(); // Total sources
    });

    // Should show recent articles
    expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    server.use(
      http.get('/articles', () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
```

#### IT-03: Protected Route Middleware
```typescript
// middleware.test.ts

describe('Authentication Middleware', () => {
  it('should redirect to login when accessing protected page without token', () => {
    const request = new NextRequest('http://localhost:3000/dashboard');
    const response = middleware(request);

    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get('location')).toBe('http://localhost:3000/login');
  });

  it('should allow access to protected page with valid token', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'auth_token=valid-token'
      }
    });

    const response = middleware(request);

    expect(response.status).toBe(200); // Continue
  });

  it('should allow access to public pages without token', () => {
    const request = new NextRequest('http://localhost:3000/');
    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
```

### E2E Testing Approach (Future)

#### E2E-01: Complete Login Flow
```typescript
// tests/e2e/auth.spec.ts

test('user can log in and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click login link
  await page.click('text=Log In');

  // Fill login form
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Log In")');

  // Should redirect to dashboard
  await expect(page).toHaveURL('http://localhost:3000/dashboard');

  // Should see dashboard content
  await expect(page.locator('h1')).toHaveText('Dashboard');
  await expect(page.locator('text=Total Articles')).toBeVisible();
});
```

### Edge Cases to Test

#### EC-01: Concurrent Login Attempts
- Multiple login attempts in quick succession
- Should handle race conditions with token storage

#### EC-02: Token Expiration During Session
- User's token expires while using the app
- Should detect expiration and redirect to login

#### EC-03: Network Interruption During API Call
- Lost connection during data fetch
- Should retry with exponential backoff

#### EC-04: Large Article Lists
- Pagination with 1000+ articles
- Should handle efficiently without memory issues

#### EC-05: Special Characters in Credentials
- Email/password with Unicode characters
- Should properly encode and transmit

#### EC-06: Browser Back Button After Logout
- User logs out then clicks back button
- Should not show cached protected content

#### EC-07: Multiple Tabs with Same Account
- User logs out in one tab
- Should clear session in all tabs (future: BroadcastChannel)

#### EC-08: API Response Timeout
- Backend takes >30s to respond
- Should abort request and show error

---

## 9. UI/UX Specifications

### Design System

#### Color Palette (Tailwind CSS)
```typescript
// tailwind.config.ts

const colors = {
  // Light mode
  background: 'hsl(0 0% 100%)',
  foreground: 'hsl(222.2 84% 4.9%)',

  // Primary brand color
  primary: {
    DEFAULT: 'hsl(222.2 47.4% 11.2%)',
    foreground: 'hsl(210 40% 98%)',
  },

  // Secondary accent
  secondary: {
    DEFAULT: 'hsl(210 40% 96.1%)',
    foreground: 'hsl(222.2 47.4% 11.2%)',
  },

  // Muted text
  muted: {
    DEFAULT: 'hsl(210 40% 96.1%)',
    foreground: 'hsl(215.4 16.3% 46.9%)',
  },

  // Accent highlights
  accent: {
    DEFAULT: 'hsl(210 40% 96.1%)',
    foreground: 'hsl(222.2 47.4% 11.2%)',
  },

  // Destructive actions
  destructive: {
    DEFAULT: 'hsl(0 84.2% 60.2%)',
    foreground: 'hsl(210 40% 98%)',
  },

  // Borders
  border: 'hsl(214.3 31.8% 91.4%)',
  input: 'hsl(214.3 31.8% 91.4%)',
  ring: 'hsl(222.2 84% 4.9%)',
};

// Dark mode (future)
const darkColors = {
  background: 'hsl(222.2 84% 4.9%)',
  foreground: 'hsl(210 40% 98%)',
  // ... similar structure for dark mode
};
```

#### Typography Scale
```css
/* Font family */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Headings */
.text-h1 { font-size: 2.5rem; line-height: 1.2; font-weight: 700; }
.text-h2 { font-size: 2rem; line-height: 1.3; font-weight: 600; }
.text-h3 { font-size: 1.5rem; line-height: 1.4; font-weight: 600; }
.text-h4 { font-size: 1.25rem; line-height: 1.5; font-weight: 500; }

/* Body text */
.text-body { font-size: 1rem; line-height: 1.6; }
.text-small { font-size: 0.875rem; line-height: 1.5; }
.text-xs { font-size: 0.75rem; line-height: 1.4; }
```

#### Spacing System
```typescript
// Following Tailwind's default scale
const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
};
```

### Component Specifications

#### Login Page
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Catchup Feed                       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │           Login to continue               │ │
│  │                                           │ │
│  │  Email                                    │ │
│  │  [_________________________________]      │ │
│  │                                           │ │
│  │  Password                                 │ │
│  │  [_________________________________]      │ │
│  │                                           │ │
│  │       [  Log In  ]                        │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Specifications**:
- Centered card layout
- Max width: 400px
- Input fields: Full width with 44px min height (touch-friendly)
- Button: Primary color, full width
- Form validation: Real-time with error messages below fields
- Loading state: Disabled button with spinner
- Responsive: Stack elements vertically on mobile

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Catchup Feed    Dashboard  Articles  Sources  Logout│  Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dashboard                                                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Total        │  │ Total        │                        │
│  │ Articles     │  │ Sources      │                        │
│  │              │  │              │                        │
│  │   1,234      │  │   45         │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
│  Recent Articles                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Article Title 1                      2 hours ago      │ │
│  │ Brief description of the article...                   │ │
│  │ Source: TechCrunch                                    │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ Article Title 2                      5 hours ago      │ │
│  │ Brief description...                                  │ │
│  │ Source: Hacker News                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [View All Articles →]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Specifications**:
- Header: Fixed position, 64px height, shadow on scroll
- Statistics cards: Grid layout (2 columns on desktop, 1 on mobile)
- Card styling: White background, subtle border, rounded corners (8px)
- Article list: Vertical stack with dividers
- Hover state: Subtle background change
- Click target: Entire article row
- Responsive: Single column on mobile (<768px)

#### Loading States
```typescript
// Skeleton loader for statistics card
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-24" /> // Label
  </CardHeader>
  <CardContent>
    <Skeleton className="h-8 w-16" /> // Number
  </CardContent>
</Card>

// Skeleton for article list
<div className="space-y-4">
  {[1, 2, 3].map(i => (
    <div key={i} className="border rounded-lg p-4">
      <Skeleton className="h-6 w-3/4 mb-2" /> // Title
      <Skeleton className="h-4 w-full mb-2" />  // Description
      <Skeleton className="h-3 w-32" />         // Source
    </div>
  ))}
</div>
```

#### Error States
```typescript
// Inline error message
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    {errorMessage}
  </AlertDescription>
</Alert>

// Full-page error
<div className="flex flex-col items-center justify-center min-h-screen p-4">
  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
  <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
  <p className="text-muted-foreground mb-6 text-center max-w-md">
    {errorMessage}
  </p>
  <Button onClick={retry}>Try Again</Button>
</div>
```

### Responsive Breakpoints
```typescript
// tailwind.config.ts
const screens = {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};
```

### Accessibility Requirements

#### Keyboard Navigation
- Tab order follows visual layout
- All interactive elements focusable
- Skip to main content link
- Escape key closes modals/dropdowns

#### Focus Indicators
```css
/* Custom focus ring */
:focus-visible {
  outline: 2px solid hsl(222.2 84% 4.9%);
  outline-offset: 2px;
}
```

#### ARIA Labels
```typescript
// Login form
<form aria-label="Login form">
  <Input
    type="email"
    aria-label="Email address"
    aria-required="true"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />

  <Button
    type="submit"
    aria-label="Log in to your account"
    aria-busy={isLoading}
  >
    {isLoading ? 'Logging in...' : 'Log In'}
  </Button>
</form>

// Dashboard statistics
<div role="region" aria-label="Statistics overview">
  <Card>
    <CardHeader>
      <CardTitle>Total Articles</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold" aria-label="Total articles count">
        {totalArticles}
      </p>
    </CardContent>
  </Card>
</div>
```

#### Screen Reader Support
```typescript
// Loading announcement
<div role="status" aria-live="polite" className="sr-only">
  {isLoading && 'Loading articles'}
  {isSuccess && `Loaded ${articles.length} articles`}
  {isError && 'Failed to load articles'}
</div>

// Article list
<ul role="list" aria-label="Recent articles">
  {articles.map(article => (
    <li key={article.id}>
      <article>
        <h3>
          <a href={`/articles/${article.id}`}>
            {article.title}
          </a>
        </h3>
        <p>{article.description}</p>
        <footer>
          <span aria-label="Source">
            {article.source.name}
          </span>
          <time dateTime={article.publishedAt}>
            {formatRelativeTime(article.publishedAt)}
          </time>
        </footer>
      </article>
    </li>
  ))}
</ul>
```

---

## 10. File Structure

### Project Directory Layout

```
catchup-feed-web/
├── .claude/                          # EDAF agent configurations
│   ├── agents/                       # Agent definitions
│   ├── scripts/                      # Build/notification scripts
│   ├── sounds/                       # Notification sounds
│   └── CLAUDE.md                     # EDAF configuration
│
├── public/                           # Static assets
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public route group
│   │   │   ├── layout.tsx            # Public layout
│   │   │   └── page.tsx              # Landing page
│   │   │
│   │   ├── (auth)/                   # Auth route group
│   │   │   └── login/
│   │   │       └── page.tsx          # Login page
│   │   │
│   │   ├── (protected)/              # Protected route group
│   │   │   ├── layout.tsx            # Protected layout with auth check
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Dashboard page
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx          # Articles list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Article detail
│   │   │   └── sources/
│   │   │       ├── page.tsx          # Sources list
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Source detail (future)
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── error.tsx                 # Global error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ... (other shadcn components)
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # Login form component
│   │   │   └── LoginForm.test.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatisticsCard.tsx    # Statistics display
│   │   │   ├── StatisticsCard.test.tsx
│   │   │   ├── RecentArticlesList.tsx # Recent articles
│   │   │   └── RecentArticlesList.test.tsx
│   │   │
│   │   ├── articles/
│   │   │   ├── ArticleCard.tsx       # Article preview card
│   │   │   ├── ArticleList.tsx       # Articles list container
│   │   │   └── ArticleDetail.tsx     # Full article view
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx            # App header/nav
│   │   │   ├── Header.test.tsx
│   │   │   └── Footer.tsx            # Page footer
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.tsx    # Loading indicator
│   │       ├── ErrorMessage.tsx      # Error display
│   │       └── EmptyState.tsx        # Empty state placeholder
│   │
│   ├── lib/
│   │   ├── api/                      # API client layer
│   │   │   ├── client.ts             # Base API client
│   │   │   ├── client.test.ts
│   │   │   ├── types.ts              # OpenAPI-generated types
│   │   │   └── endpoints/
│   │   │       ├── auth.ts           # Auth endpoints
│   │   │       ├── articles.ts       # Articles endpoints
│   │   │       └── sources.ts        # Sources endpoints
│   │   │
│   │   ├── auth/                     # Auth utilities
│   │   │   ├── token.ts              # Token storage/retrieval
│   │   │   ├── token.test.ts
│   │   │   ├── session.ts            # Session validation
│   │   │   └── session.test.ts
│   │   │
│   │   └── utils.ts                  # Shared utilities
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── useAuth.test.ts
│   │   ├── useArticles.ts            # Articles data hook
│   │   ├── useSources.ts             # Sources data hook
│   │   └── useDashboardStats.ts      # Dashboard stats hook
│   │
│   ├── providers/                    # React context providers
│   │   ├── QueryProvider.tsx         # TanStack Query provider
│   │   └── ThemeProvider.tsx         # Theme provider (future)
│   │
│   └── types/                        # TypeScript type definitions
│       ├── api.d.ts                  # Generated from OpenAPI
│       └── index.d.ts                # Custom types
│
├── tests/                            # Test utilities and setup
│   ├── setup.ts                      # Vitest setup
│   ├── mocks/
│   │   ├── handlers.ts               # MSW request handlers
│   │   └── data.ts                   # Mock data generators
│   └── e2e/                          # Playwright E2E tests (future)
│       └── auth.spec.ts
│
├── docs/                             # Documentation
│   ├── designs/                      # Design documents
│   │   └── initial-setup-auth-dashboard.md
│   ├── plans/                        # Task plans
│   ├── evaluations/                  # Evaluation results
│   ├── screenshots/                  # UI screenshots
│   └── REQUIREMENTS.md               # Requirements document
│
├── .env.local                        # Environment variables (gitignored)
├── .env.example                      # Environment variables template
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore
├── middleware.ts                     # Next.js middleware (auth)
├── next.config.ts                    # Next.js configuration
├── package.json
├── postcss.config.mjs                # PostCSS configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── vitest.config.ts                  # Vitest configuration
└── README.md                         # Project documentation
```

### Environment Variables

#### .env.example
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Application environment
NODE_ENV=development

# Future: Additional configuration
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Configuration Files

#### package.json (Partial)
```json
{
  "name": "catchup-feed-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "generate:api": "openapi-typescript http://localhost:8080/swagger/doc.json -o src/types/api.d.ts"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "isomorphic-dompurify": "^2.9.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "msw": "^2.0.0",
    "openapi-typescript": "^6.7.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 11. Implementation Phases

### Phase 1: Project Setup (SETUP Tasks)
**Goal**: Establish development environment

**Tasks**:
1. Initialize Next.js 15 project with TypeScript
2. Configure Tailwind CSS 4.x
3. Install and configure shadcn/ui components
4. Setup TanStack Query with providers
5. Configure Vitest and React Testing Library
6. Setup ESLint and Prettier
7. Generate API types from OpenAPI specification
8. Create basic file structure

**Deliverables**:
- Working development server (`npm run dev`)
- Passing linter (`npm run lint`)
- Empty test suite passing (`npm test`)
- Type-safe API client structure

**Validation**:
- Development server runs on localhost:3000
- TypeScript compiles without errors
- All configuration files in place

### Phase 2: Authentication System (AUTH Tasks)
**Goal**: Implement secure JWT authentication

**Tasks**:
1. Create token storage utilities
2. Implement API client with JWT injection
3. Build login page UI with form validation
4. Create useAuth hook for authentication state
5. Implement logout functionality
6. Add authentication middleware for route protection
7. Write unit tests for auth utilities
8. Write integration tests for login flow

**Deliverables**:
- Functional login page
- Token storage in localStorage
- Protected route middleware
- Test coverage >80% for auth code

**Validation**:
- Users can log in with valid credentials
- Invalid credentials show error message
- Protected pages redirect unauthenticated users
- Logout clears token and redirects

### Phase 3: Dashboard Implementation (DASH Tasks)
**Goal**: Create statistics and recent articles dashboard

**Tasks**:
1. Create dashboard layout
2. Implement StatisticsCard component
3. Implement RecentArticlesList component
4. Create useDashboardStats hook with React Query
5. Add loading and error states
6. Implement navigation to article details
7. Write component tests
8. Write integration tests for data fetching

**Deliverables**:
- Functional dashboard page
- Statistics display (total articles, sources)
- Recent articles list with navigation
- Responsive layout
- Test coverage >80%

**Validation**:
- Dashboard loads successfully after login
- Statistics display accurate counts
- Recent articles list shows 10 items
- Clicking article navigates to detail page
- Loading states visible during data fetch
- Errors handled gracefully

### Phase 4: Testing & Refinement
**Goal**: Ensure quality and accessibility

**Tasks**:
1. Achieve >80% test coverage
2. Verify WCAG 2.1 AA compliance
3. Test keyboard navigation
4. Test error scenarios
5. Performance optimization
6. Documentation review

**Deliverables**:
- Test coverage report
- Accessibility audit results
- Performance metrics

**Validation**:
- All tests passing
- No console errors/warnings
- Lighthouse score >90
- Accessible via keyboard
- Screen reader compatible

---

## 12. Success Metrics & KPIs

### Functional Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Login success rate | >99% | Successful logins / Total attempts |
| Dashboard load time | <2s | Time to display statistics |
| API error rate | <1% | Failed requests / Total requests |
| Test coverage | >80% | Lines covered / Total lines |

### Performance Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse |
| First Input Delay (FID) | <100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse |
| Time to Interactive (TTI) | <3.5s | Lighthouse |
| Bundle size (initial) | <200KB | webpack-bundle-analyzer |

### Accessibility Metrics

| Metric | Target | Tool |
|--------|--------|------|
| WCAG 2.1 AA compliance | 100% | axe DevTools |
| Keyboard navigation | 100% functional | Manual testing |
| Screen reader compatibility | 100% | NVDA/VoiceOver |
| Color contrast ratio | >4.5:1 | Contrast Checker |

### Developer Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| TypeScript errors | 0 | `tsc --noEmit` |
| ESLint warnings | 0 | `npm run lint` |
| Build time | <30s | CI/CD pipeline |
| Hot reload time | <2s | Local development |

---

## 13. Dependencies & Constraints

### External Dependencies

#### Backend API (catchup-feed)
- **Dependency**: Must be running on localhost:8080
- **Constraint**: Cannot modify backend API
- **Impact**: Frontend must adapt to existing API contract
- **Mitigation**: Use OpenAPI-generated types for type safety

#### OpenAPI Specification
- **Dependency**: Backend provides Swagger JSON
- **Constraint**: Type generation requires running backend
- **Impact**: Development requires backend access
- **Mitigation**: Commit generated types to version control

### Technical Constraints

#### Next.js 15 App Router
- **Constraint**: Must use App Router (no Pages Router)
- **Impact**: Different routing and layout patterns
- **Mitigation**: Follow Next.js 15 best practices

#### Browser Compatibility
- **Constraint**: Support latest 2 versions of major browsers
- **Impact**: Cannot use cutting-edge features
- **Mitigation**: Use feature detection and polyfills

#### No Server-Side Sessions
- **Constraint**: JWT-only authentication (no cookies yet)
- **Impact**: Token stored in localStorage
- **Security Risk**: XSS vulnerability concern
- **Mitigation**: Implement strict CSP headers

### Resource Constraints

#### Development Timeline
- **Constraint**: Estimated 2-3 weeks for initial implementation
- **Impact**: Must prioritize features
- **Mitigation**: Focus on Phase 1-3, defer enhancements

#### Team Size
- **Constraint**: Solo developer (portfolio project)
- **Impact**: Limited bandwidth for features
- **Mitigation**: Automate testing and deployment

---

## 14. Future Enhancements

### Post-MVP Features

1. **Dark Mode Support**
   - Theme toggle in header
   - Persist preference in localStorage
   - System preference detection

2. **Article Bookmarking**
   - Bookmark button on articles
   - Dedicated bookmarks page
   - Backend API integration required

3. **Advanced Filtering**
   - Filter articles by date range
   - Filter by source
   - Search by title/content
   - URL query parameter persistence

4. **Pagination**
   - Infinite scroll for articles list
   - "Load more" button
   - Virtual scrolling for performance

5. **User Profile**
   - User settings page
   - Email preferences
   - Notification settings

6. **Real-time Updates**
   - WebSocket connection for new articles
   - Toast notifications
   - Badge count on navigation

7. **Offline Support**
   - Service Worker for caching
   - Offline indicator
   - Queue API requests when offline

8. **Performance Optimizations**
   - Image lazy loading
   - Code splitting by route
   - Prefetch links on hover
   - Service Worker caching

9. **Enhanced Security**
   - Move JWT to httpOnly cookies
   - Implement refresh token rotation
   - Add CSRF protection
   - Rate limiting on client

10. **Analytics Integration**
    - Google Analytics 4
    - Custom event tracking
    - Performance monitoring
    - Error tracking (Sentry)

---

## 15. Open Questions & Decisions Needed

### Technical Decisions

1. **Token Refresh Strategy**
   - Question: Should we implement automatic token refresh?
   - Options:
     - A) Refresh on 401 response
     - B) Refresh proactively before expiration
     - C) No refresh (force re-login)
   - Recommendation: Option A (simpler, backend-dependent)

2. **State Management**
   - Question: Do we need global state beyond React Query?
   - Options:
     - A) React Query only
     - B) Add Zustand for UI state
     - C) Use React Context
   - Recommendation: Option A (sufficient for MVP)

3. **Error Logging**
   - Question: Where should we log frontend errors?
   - Options:
     - A) Console only (development)
     - B) Sentry (production)
     - C) Custom backend endpoint
   - Recommendation: Option A for MVP, B for production

4. **Testing Strategy Priority**
   - Question: What test type should we prioritize?
   - Options:
     - A) Unit tests first
     - B) Integration tests first
     - C) E2E tests first
   - Recommendation: Option B (highest ROI)

### Design Decisions

5. **Empty State Handling**
   - Question: How to handle empty article lists?
   - Options:
     - A) Show "No articles" message
     - B) Show illustration with message
     - C) Hide section entirely
   - Recommendation: Option B (better UX)

6. **Loading State Duration**
   - Question: When to show skeleton vs spinner?
   - Options:
     - A) Always show skeleton
     - B) Skeleton for first load, spinner for refresh
     - C) Skeleton <1s, spinner >1s
   - Recommendation: Option B (less jarring)

### Process Decisions

7. **API Type Generation**
   - Question: When to regenerate API types?
   - Options:
     - A) Manual on backend changes
     - B) Pre-commit hook
     - C) CI/CD pipeline
   - Recommendation: Option A for MVP (manual control)

8. **Component Documentation**
   - Question: How to document components?
   - Options:
     - A) JSDoc comments
     - B) Storybook
     - C) Markdown files
   - Recommendation: Option A (lightweight)

---

## 16. References & Resources

### Documentation

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)

### Backend Integration

- [catchup-feed Backend Repository](https://github.com/Tsuchiya2/catchup-feed)
- OpenAPI Specification: `http://localhost:8080/swagger/doc.json`
- Swagger UI: `http://localhost:8080/swagger/index.html`

### Best Practices

- [Web Content Accessibility Guidelines (WCAG 2.1)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Tools

- [openapi-typescript](https://github.com/drwpow/openapi-typescript) - Type generation
- [MSW](https://mswjs.io) - API mocking for tests
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audit
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing

---

**End of Design Document**

This design document provides comprehensive specifications for the initial setup, authentication system, and dashboard implementation of the Catchup Feed Web application. The design follows modern React/Next.js best practices, emphasizes security and accessibility, and maintains type safety throughout the application.

The design is ready for evaluation by the EDAF evaluators.
