/**
 * Subscribers (friends) API Endpoints
 *
 * CRUD for subscribers plus feed token issue/revoke.
 *
 * Contract notes:
 * - DELETE /subscribers/:id is a SOFT delete (deactivation); the row keeps
 *   existing with `deactivated_at` set.
 * - PUT /subscribers/:id is a FULL REPLACEMENT: always send every field.
 * - POST /subscribers/:id/tokens returns the plaintext token and feed URL
 *   exactly once (D-5: hash-only storage). They can never be fetched again.
 * - DELETE /tokens/:id revokes a token irreversibly.
 */

import { apiClient } from '@/lib/api/client';
import type {
  Subscriber,
  SubscriberInput,
  FeedToken,
  IssuedFeedToken,
  RevokedFeedToken,
} from '@/types/api';

/**
 * Fetch all subscribers (active and deactivated)
 *
 * @returns Promise resolving to the subscribers array
 * @throws {ApiError} When the request fails
 */
export async function getSubscribers(): Promise<Subscriber[]> {
  return apiClient.get<Subscriber[]>('/subscribers');
}

/**
 * Fetch a single subscriber by ID
 *
 * @param id - Subscriber ID
 * @returns Promise resolving to the subscriber
 * @throws {ApiError} When the subscriber is not found or the request fails
 */
export async function getSubscriber(id: number): Promise<Subscriber> {
  return apiClient.get<Subscriber>(`/subscribers/${id}`);
}

/**
 * Create a new subscriber
 *
 * @param input - name is required; email / note are optional
 * @returns Promise resolving to the created subscriber
 * @throws {ApiError} When the request fails (400 name required, 401)
 */
export async function createSubscriber(input: SubscriberInput): Promise<Subscriber> {
  return apiClient.post<Subscriber>('/subscribers', input);
}

/**
 * Update a subscriber.
 *
 * PUT is a FULL REPLACEMENT on the backend: every field in the body is
 * written as-is, so callers must send the complete desired state
 * (name, email, note) — omitting a field clears it.
 *
 * @param id - Subscriber ID
 * @param input - Complete new state for the subscriber
 * @returns Promise resolving to the updated subscriber
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function updateSubscriber(id: number, input: SubscriberInput): Promise<Subscriber> {
  return apiClient.put<Subscriber>(`/subscribers/${id}`, input);
}

/**
 * Deactivate a subscriber (soft delete).
 *
 * The subscriber is never physically removed; the backend sets
 * `deactivated_at` and the friend disappears from active delivery.
 *
 * @param id - Subscriber ID
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function deactivateSubscriber(id: number): Promise<void> {
  await apiClient.delete(`/subscribers/${id}`);
}

/**
 * List feed tokens for a subscriber.
 *
 * Plaintext tokens are NEVER returned here (D-5) — only issue date and
 * revocation status.
 *
 * @param subscriberId - Subscriber ID
 * @returns Promise resolving to the token list
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function getSubscriberTokens(subscriberId: number): Promise<FeedToken[]> {
  return apiClient.get<FeedToken[]>(`/subscribers/${subscriberId}/tokens`);
}

/**
 * Issue a new feed token for a subscriber.
 *
 * The response contains the plaintext token and the ready-to-paste
 * subscription URL (`feed_url`). This is the ONLY time they are available
 * (D-5) — surface them to the user immediately and warn that closing the
 * view loses them forever (revoke + re-issue is the only recovery).
 *
 * @param subscriberId - Subscriber ID
 * @returns Promise resolving to the issued token (with one-time plaintext)
 * @throws {ApiError} When the request fails (400, 401, 404, 409 subscriber is deactivated)
 */
export async function issueToken(subscriberId: number): Promise<IssuedFeedToken> {
  return apiClient.post<IssuedFeedToken>(`/subscribers/${subscriberId}/tokens`);
}

/**
 * Revoke a feed token. IRREVERSIBLE.
 *
 * A revoked token can never be re-activated; the friend's podcast app will
 * stop receiving updates until a new token is issued and re-subscribed.
 *
 * @param tokenId - Token ID
 * @returns Promise resolving to the revoked token record
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function revokeToken(tokenId: number): Promise<RevokedFeedToken> {
  return apiClient.delete<RevokedFeedToken>(`/tokens/${tokenId}`);
}

/**
 * Export types for convenience
 */
export type { Subscriber, SubscriberInput, FeedToken, IssuedFeedToken, RevokedFeedToken };
