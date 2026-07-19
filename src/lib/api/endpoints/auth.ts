/**
 * Authentication API Endpoints
 *
 * Functions for authentication-related API calls.
 *
 * Auth is cookie-based after H-1 (D-22): the backend issues an HttpOnly
 * `catchup_feed_auth_token` cookie on login and clears it on logout. The
 * JWT is never stored by JS. The login response body still contains a
 * `token` for backwards compatibility, but the frontend does NOT persist it.
 */

import { apiClient } from '@/lib/api/client';
import type { LoginRequest, LoginResponse, Me } from '@/types/api';

/**
 * Login with email and password
 *
 * On success the backend sets an HttpOnly auth cookie via Set-Cookie. The
 * returned `token` in the body is intentionally NOT persisted anywhere by the
 * frontend (H-1): the cookie is the sole source of truth for authentication.
 *
 * @param email - User email address
 * @param password - User password
 * @returns Promise resolving to the login response
 * @throws {ApiError} When login fails (invalid credentials, server error)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const requestBody: LoginRequest = {
    email,
    password,
  };

  const response = await apiClient.post<LoginResponse>('/auth/token', requestBody, {
    requiresAuth: false, // Login endpoint doesn't require authentication
  });

  return response;
}

/**
 * Logout — invalidate the HttpOnly auth cookie server-side.
 *
 * The JWT lives in an HttpOnly cookie that JS cannot delete, so logout MUST
 * hit the backend, which responds with a Max-Age=0 Set-Cookie to expire it
 * (D-22). POST-only (GET returns 405). Sends credentials so the cookie is
 * attached and the correct session is cleared.
 *
 * @returns Promise that resolves once the cookie has been expired (204)
 * @throws {ApiError} When the request fails (callers treat logout as
 *   best-effort and still clear client state regardless)
 */
export async function logout(): Promise<void> {
  await apiClient.post<void>('/auth/logout', undefined, {
    requiresAuth: false, // Logout endpoint is idempotent and auth-optional
    retry: false,
  });
}

/**
 * Fetch the authenticated user's identity and role (GET /auth/me).
 *
 * The JWT is in an HttpOnly cookie that JS cannot read (D-22), so this
 * endpoint is the ONLY sanctioned way for the frontend to learn its role
 * (`admin` / `viewer`, D-27 (5)). The role is never persisted client-side;
 * display gating always re-derives it from this call (the backend enforces
 * authorization regardless, so a spoofed role only breaks the spoofer's UI).
 *
 * @returns Promise resolving to `{ sub, role }`
 * @throws {ApiError} 401 when unauthenticated, 403 for tokens without a
 *   valid role or deactivated viewers
 */
export async function getMe(): Promise<Me> {
  return apiClient.get<Me>('/auth/me');
}
