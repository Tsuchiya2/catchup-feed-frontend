/**
 * useAuth Hook
 *
 * Custom React hook for authentication state management using React Query.
 * Provides login, logout, and authentication status.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { login as loginApi } from '@/lib/api/endpoints/auth';
import {
  getAuthToken,
  setAuthToken,
  setRefreshToken,
  clearAllTokens,
  isTokenExpired,
} from '@/lib/auth/TokenManager';

/**
 * Authentication hook return type
 */
interface UseAuthReturn {
  /** Whether the user is authenticated with a valid token */
  isAuthenticated: boolean;
  /** The JWT token string, or null if not authenticated */
  token: string | null;
  /** Function to log in with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Function to log out (clears token and redirects) */
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const currentToken = getAuthToken();
    if (currentToken && !isTokenExpired()) {
      setToken(currentToken);
      setIsAuthenticated(true);
      // Set cookie for middleware
      if (typeof document !== 'undefined') {
        document.cookie = `catchup_feed_auth_token=${currentToken}; path=/; max-age=86400; SameSite=Strict`;
      }
    } else {
      setToken(null);
      setIsAuthenticated(false);
      // Clear cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'catchup_feed_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await loginApi(email, password);
      return response;
    },
    onSuccess: (response) => {
      // Store access token in TokenManager
      setAuthToken(response.token);
      setToken(response.token);
      setIsAuthenticated(true);

      // Store refresh token if provided
      if (response.refresh_token) {
        setRefreshToken(response.refresh_token);
      }

      // Set cookie for middleware (expires in 24 hours)
      if (typeof document !== 'undefined') {
        document.cookie = `catchup_feed_auth_token=${response.token}; path=/; max-age=86400; SameSite=Strict`;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: () => {
      // Clear all tokens on login failure
      clearAllTokens();
      setToken(null);
      setIsAuthenticated(false);

      // Clear cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'catchup_feed_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
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
   * Logout (clear all tokens and redirect to login page)
   */
  const logout = (): void => {
    // Clear all tokens from TokenManager
    clearAllTokens();
    setToken(null);
    setIsAuthenticated(false);

    // Clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'catchup_feed_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

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

    // Redirect to login page
    router.push('/login');
  };

  return {
    isAuthenticated,
    token,
    login,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}
