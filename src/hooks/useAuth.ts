/**
 * useAuth Hook
 *
 * Custom React hook for the login/logout actions using React Query.
 *
 * After H-1 (D-22) the JWT is stored only in an HttpOnly cookie, so this hook
 * no longer tracks or exposes client-visible auth state — route protection is
 * handled by the proxy and unauthenticated API calls fail with 401.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login as loginApi, logout as logoutApi } from '@/lib/api/endpoints/auth';
import { clearCsrfToken } from '@/lib/security/CsrfTokenManager';
import { logger } from '@/lib/logger';

/**
 * Authentication hook return type
 *
 * Note: after H-1 (D-22) the JWT lives in an HttpOnly cookie that JS cannot
 * read. This hook therefore no longer exposes the token or a client-side
 * `isAuthenticated` flag derived from it — session state is enforced by the
 * proxy (route protection) and by 401s on protected API calls. The hook only
 * drives the login/logout actions.
 */
interface UseAuthReturn {
  /** Function to log in with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Function to log out (invalidates the auth cookie and redirects) */
  logout: () => Promise<void>;
  /** Whether a login request is in progress */
  isLoading: boolean;
  /** Error from the last login attempt, or null */
  error: Error | null;
}

/**
 * Custom hook for authentication
 *
 * @returns Authentication state and methods
 *
 * @example
 * ```typescript
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     try {
 *       await login(email, password);
 *       // User will be redirected to dashboard
 *     } catch (err) {
 *       // Error is available in the error state
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <p>{error.message}</p>}
 *       <button disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();

  // Login mutation. On success the backend has already set the HttpOnly auth
  // cookie via Set-Cookie; we deliberately do NOT persist the body `token`
  // anywhere (localStorage / JS-readable cookie) — that is the H-1 fix.
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await loginApi(email, password);
      return response;
    },
    onSuccess: () => {
      // Auth is now carried by the HttpOnly cookie the backend just set.
      // Navigate to the dashboard; the proxy will read that cookie server-side.
      router.push('/dashboard');
      router.refresh();
    },
  });

  /**
   * Login with email and password
   *
   * @param email - User email address
   * @param password - User password
   * @throws {ApiError} When login fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    await loginMutation.mutateAsync({ email, password });
  };

  /**
   * Logout — invalidate the HttpOnly auth cookie and clear client state.
   *
   * The JWT is in an HttpOnly cookie that JS cannot delete, so we must ask the
   * backend to expire it (POST /auth/logout). This is best-effort: even if the
   * request fails (offline, server error) we still purge client-side state and
   * bounce to /login so the UI never appears "stuck" signed in (縮退許容).
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch (error) {
      // Best-effort: proceed with client-side cleanup regardless.
      logger.warn('Logout request failed; clearing client state anyway', { error });
    }

    // Clear the client-side CSRF token (the JWT cookie is cleared server-side).
    clearCsrfToken();

    // Purge any API responses the Service Worker cached while authenticated
    // (M-3). Sensitive endpoints are never cached, but this empties the whole
    // api-cache on sign-out as defense in depth. Best-effort and non-blocking.
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_API_CACHE' });
    }

    // Redirect to login page.
    router.push('/login');
    router.refresh();
  };

  return {
    login,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}
