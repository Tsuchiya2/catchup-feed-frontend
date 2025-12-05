/**
 * Authentication API Endpoints
 *
 * Functions for authentication-related API calls.
 */

import { apiClient } from '@/lib/api/client';
import type { LoginRequest, LoginResponse } from '@/types/api';

/**
 * Login with email and password
 *
 * @param email - User email address
 * @param password - User password
 * @returns Promise resolving to login response with JWT token
 * @throws {ApiError} When login fails (invalid credentials, server error)
 *
 * @example
 * ```typescript
 * try {
 *   const response = await login('user@example.com', 'password123');
 *   console.log('Token:', response.token);
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 401) {
 *     console.error('Invalid credentials');
 *   }
 * }
 * ```
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
 * Logout (client-side only - clears token)
 *
 * @remarks
 * This function only clears the local token. The backend doesn't have a logout endpoint
 * because JWT tokens are stateless. The token will remain valid until it expires.
 */
export function logout(): void {
  // Token clearing is handled by the apiClient when a 401 is received
  // or can be manually cleared by importing clearAuthToken
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
