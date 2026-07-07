/**
 * Learning (spaced repetition) API Endpoints
 *
 * Drives the理解トラッカー: the grading page (/learning), the item tracker
 * (/learning/items), and book management (/learning/books). All endpoints
 * require JWT (they ride the existing authenticated client).
 *
 * Contract notes:
 * - POST /reviews/:id/grade is ONE-SHOT: grading an already-graded log
 *   (manual or 48h auto) returns 409 and cannot be overridden.
 * - POST /items/:id/retire and POST /books/:id/(de)activate are idempotent.
 * - Activating a book replaces whatever was active (at most one active book).
 */

import { apiClient } from '@/lib/api/client';
import type {
  PendingReview,
  GradeResult,
  GradeResponse,
  LearningItem,
  LearningItemStatus,
  RetireResponse,
  LearningBook,
} from '@/types/api';

/**
 * Fetch pending (ungraded) reviews, oldest first. Empty array = nothing to
 * grade today (a normal, healthy state — not an error).
 *
 * @returns Promise resolving to the pending review list
 * @throws {ApiError} When the request fails (401, 500)
 */
export async function getPendingReviews(): Promise<PendingReview[]> {
  return apiClient.get<PendingReview[]>('/learning/reviews/pending');
}

/**
 * Grade a review (○△×). One-shot: a second grade on the same log returns
 * 409 (already graded — e.g. another device or the 48h auto-advance won).
 *
 * @param logId - review_logs id (log_id from the pending list)
 * @param result - good | fuzzy | forgot
 * @returns Promise resolving to the item's new spaced-repetition state
 * @throws {ApiError} When the request fails (400, 401, 404, 409 already graded)
 */
export async function gradeReview(logId: number, result: GradeResult): Promise<GradeResponse> {
  return apiClient.post<GradeResponse>(`/learning/reviews/${logId}/grade`, { result });
}

/**
 * Fetch learning items, filtered by status (defaults to active on the
 * backend when omitted).
 *
 * @param status - 'active' (current) or 'retired' (graduated/archived)
 * @returns Promise resolving to the item list
 * @throws {ApiError} When the request fails (400, 401, 500)
 */
export async function getLearningItems(status?: LearningItemStatus): Promise<LearningItem[]> {
  const query = status ? `?status=${status}` : '';
  return apiClient.get<LearningItem[]>(`/learning/items${query}`);
}

/**
 * Manually retire (archive) a learning item — "もう追わなくていい".
 * Idempotent: retiring an already-retired item returns its record.
 *
 * @param id - learning item id
 * @returns Promise resolving to the retired item record
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function retireLearningItem(id: number): Promise<RetireResponse> {
  return apiClient.post<RetireResponse>(`/learning/items/${id}/retire`);
}

/**
 * Fetch ingested books with their review progress (D-20).
 *
 * @returns Promise resolving to the book list
 * @throws {ApiError} When the request fails (401, 500)
 */
export async function getLearningBooks(): Promise<LearningBook[]> {
  return apiClient.get<LearningBook[]>('/learning/books');
}

/**
 * Set a book as the in-progress (active) one. At most one book is active;
 * the backend demotes the previous active book to idle in one operation.
 * Activating a `finished` book restarts the read from the beginning.
 *
 * @param id - book id
 * @returns Promise resolving to the updated book
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function activateBook(id: number): Promise<LearningBook> {
  return apiClient.post<LearningBook>(`/learning/books/${id}/activate`);
}

/**
 * Pause / remove a book from rotation (status → idle, cursor kept).
 * Idempotent.
 *
 * @param id - book id
 * @returns Promise resolving to the updated book
 * @throws {ApiError} When the request fails (400, 401, 404)
 */
export async function deactivateBook(id: number): Promise<LearningBook> {
  return apiClient.post<LearningBook>(`/learning/books/${id}/deactivate`);
}

/**
 * Export types for convenience
 */
export type {
  PendingReview,
  GradeResult,
  GradeResponse,
  LearningItem,
  LearningItemStatus,
  RetireResponse,
  LearningBook,
};
