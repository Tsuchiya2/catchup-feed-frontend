/**
 * Book PDF Management API Endpoints (D-25)
 *
 * Upload / list / delete for the book PDFs that feed the book RAG. All
 * endpoints require JWT (they ride the existing authenticated client).
 *
 * Contract notes:
 * - POST /books stores the PDF on the Pi and queues a `book_ingest` job;
 *   the actual ingest runs on the Mac's nightly batch (03:00, C-4). A
 *   same-name re-upload REPLACES the stored file and re-queues the job
 *   (idempotent; a still-pending job is reused with the new title).
 * - DELETE /books/:filename removes the books row (cascade), the PDF file,
 *   and any pending ingest job. Only `deletable: true` entries (Pi uploads)
 *   can be deleted here; CLI-ingested books stay managed by the CLI.
 * - 413 = file exceeds the 100MB limit, 400 = not a valid PDF.
 */

import { apiClient } from '@/lib/api/client';
import type { PdfBook, UploadBookInput } from '@/types/api';

/**
 * Upload timeout: a 100MB PDF over the Cloudflare tunnel can take minutes,
 * so the default 30s client timeout is far too tight.
 */
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Fetch all managed books (Pi uploads and CLI-ingested), with their
 * ingest status.
 *
 * @returns Promise resolving to the book list
 * @throws {ApiError} When the request fails (401, 500)
 */
export async function getBooks(): Promise<PdfBook[]> {
  return apiClient.get<PdfBook[]>('/books');
}

/**
 * Upload a book PDF. Multipart: `file` (required) + `title` (optional).
 *
 * Retries are disabled: a large upload should fail fast and let the user
 * retry deliberately rather than silently re-sending 100MB.
 *
 * @param input - PDF file and optional title
 * @returns Promise resolving to the created/updated book entry (status pending)
 * @throws {ApiError} When the request fails (400 invalid PDF, 401, 413 over 100MB)
 */
export async function uploadBook(input: UploadBookInput): Promise<PdfBook> {
  const formData = new FormData();
  formData.append('file', input.file);
  if (input.title) {
    formData.append('title', input.title);
  }
  return apiClient.post<PdfBook>('/books', formData, {
    timeout: UPLOAD_TIMEOUT_MS,
    retry: false,
  });
}

/**
 * Delete an uploaded book by its canonical filename: removes the books row
 * (with chunks and learning items), the PDF on the Pi, and any pending
 * ingest job. Only works for `deletable: true` entries.
 *
 * @param filename - Canonical filename (e.g. "golang-book.pdf")
 * @throws {ApiError} When the request fails (400, 401, 404 nothing to delete)
 */
export async function deleteBook(filename: string): Promise<void> {
  await apiClient.delete(`/books/${encodeURIComponent(filename)}`);
}

/**
 * Export types for convenience
 */
export type { PdfBook, UploadBookInput };
