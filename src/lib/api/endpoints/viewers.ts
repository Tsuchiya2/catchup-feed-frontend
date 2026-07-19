/**
 * Viewers (read-only accounts, D-27) API Endpoints
 *
 * Admin-only CRUD for the `viewers` table: friend accounts that can log in
 * to the dashboard and see the active source list, nothing else.
 *
 * Contract notes:
 * - All endpoints are admin-only (viewer JWTs get 403).
 * - POST /viewers requires name + email + password (8–72 bytes); the email
 *   must be unique (409 on duplicates).
 * - PUT /viewers/:id updates name/email; password is OPTIONAL and only
 *   resets when the key is present — omit it to keep the current password.
 * - PUT /viewers/:id/active toggles logical deactivation (deactivated_at
 *   set/clear). Idempotent and reversible; deactivation takes effect on the
 *   viewer's next request (DB re-check, no JWT-expiry wait — D-27 (4)).
 * - DELETE /viewers/:id is a PHYSICAL delete (unlike subscribers). It
 *   cannot be undone.
 */

import { apiClient } from '@/lib/api/client';
import type { Viewer, ViewerCreateInput, ViewerUpdateInput } from '@/types/api';

/**
 * Fetch all viewers (active and deactivated)
 *
 * @returns Promise resolving to the viewers array
 * @throws {ApiError} When the request fails (401, 403 non-admin)
 */
export async function getViewers(): Promise<Viewer[]> {
  return apiClient.get<Viewer[]>('/viewers');
}

/**
 * Create a new viewer account.
 *
 * @param input - name, email (login identifier, unique) and password
 *   (8–72 bytes; the admin sets it and shares it out-of-band)
 * @returns Promise resolving to the created viewer
 * @throws {ApiError} When the request fails (400, 401, 403, 409 duplicate email)
 */
export async function createViewer(input: ViewerCreateInput): Promise<Viewer> {
  return apiClient.post<Viewer>('/viewers', input);
}

/**
 * Update a viewer's name / email, optionally resetting the password.
 *
 * Omit `password` (or pass undefined) to keep the current password; when
 * present it must be 8–72 bytes.
 *
 * @param id - Viewer ID
 * @param input - New name/email and optional new password
 * @returns Promise resolving to the updated viewer
 * @throws {ApiError} When the request fails (400, 401, 403, 404, 409 duplicate email)
 */
export async function updateViewer(id: number, input: ViewerUpdateInput): Promise<Viewer> {
  return apiClient.put<Viewer>(`/viewers/${id}`, input);
}

/**
 * Toggle a viewer's active state (logical deactivation, reversible).
 *
 * Deactivation is enforced on the viewer's next request via DB re-check —
 * it does NOT wait for their JWT to expire (D-27 (4)).
 *
 * @param id - Viewer ID
 * @param active - true to (re)activate, false to deactivate
 * @returns Promise resolving to the toggled viewer
 * @throws {ApiError} When the request fails (400, 401, 403, 404)
 */
export async function setViewerActive(id: number, active: boolean): Promise<Viewer> {
  return apiClient.put<Viewer>(`/viewers/${id}/active`, { active });
}

/**
 * Delete a viewer PERMANENTLY (physical delete, D-27 (4)).
 *
 * Unlike subscribers there is no soft-delete here: the row is removed and
 * cannot be recovered. Their existing JWT stops working on the next request.
 *
 * @param id - Viewer ID
 * @throws {ApiError} When the request fails (400, 401, 403, 404)
 */
export async function deleteViewer(id: number): Promise<void> {
  await apiClient.delete(`/viewers/${id}`);
}

/**
 * Export types for convenience
 */
export type { Viewer, ViewerCreateInput, ViewerUpdateInput };
