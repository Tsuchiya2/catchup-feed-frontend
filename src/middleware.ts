/**
 * Next.js Middleware for Protected Routes
 *
 * This middleware protects routes that require authentication.
 * It checks for a valid JWT token and redirects unauthenticated users to the login page.
 *
 * NOTE: Next.js middleware runs on the Edge runtime, which doesn't have access to localStorage.
 * Token validation is performed client-side using the isAuthenticated helper.
 * This middleware primarily handles redirects based on route patterns.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected route patterns
 * These routes require authentication
 */
const PROTECTED_ROUTES = ['/dashboard', '/articles', '/sources'];

/**
 * Public route patterns
 * These routes are accessible without authentication
 */
const PUBLIC_ROUTES = ['/', '/login'];

/**
 * Check if a path matches any of the protected routes
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path matches any of the public routes
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route);
}

/**
 * Middleware function
 *
 * @param request - Next.js request object
 * @returns Next.js response (redirect or continue)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies (set by client-side after login)
  const token = request.cookies.get('catchup_feed_auth_token')?.value;
  const hasToken = Boolean(token);

  // Protected routes: redirect to /login if no token
  if (isProtectedRoute(pathname) && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return to original destination after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Login page: redirect to /dashboard if already authenticated
  if (pathname === '/login' && hasToken) {
    // Check if there's a redirect parameter
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const dashboardUrl = new URL(redirectParam || '/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow request to continue
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
