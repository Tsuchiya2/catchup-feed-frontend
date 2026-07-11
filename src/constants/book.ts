/**
 * Book PDF management constants (D-25)
 */

import type { BookIngestStatus } from '@/types/api';

/**
 * Upload size limit: 100MB per book (D-25, aligned with the Cloudflare
 * free-plan request body limit). Checked client-side before sending; the
 * backend answers 413 for anything larger.
 */
export const BOOK_MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

/**
 * Ingest status labels for the badge display.
 * The spec (D-25) names these in Japanese: 待機 / 処理中 / 完了 / 失敗.
 */
export const BOOK_INGEST_STATUS_LABELS: Record<BookIngestStatus, string> = {
  pending: '待機',
  processing: '処理中',
  done: '完了',
  failed: '失敗',
};

/**
 * Test IDs for book management components.
 */
export const BOOK_TEST_IDS = {
  /** A book row/card in the list */
  CARD: 'book-card',
  /** Ingest status badge on a card */
  STATUS_BADGE: 'book-status-badge',
  /** Delete button on a card */
  DELETE_BUTTON: 'book-delete-button',
  /** Delete confirmation dialog */
  DELETE_DIALOG: 'book-delete-dialog',
  /** Delete confirm button */
  DELETE_CONFIRM_BUTTON: 'book-delete-confirm-button',
  /** Delete cancel button */
  DELETE_CANCEL_BUTTON: 'book-delete-cancel-button',
  /** Upload dialog */
  UPLOAD_DIALOG: 'book-upload-dialog',
  /** File input in the upload dialog */
  UPLOAD_FILE_INPUT: 'book-upload-file-input',
  /** Title input in the upload dialog */
  UPLOAD_TITLE_INPUT: 'book-upload-title-input',
  /** Upload submit button */
  UPLOAD_SUBMIT_BUTTON: 'book-upload-submit-button',
  /** Upload error message */
  UPLOAD_ERROR: 'book-upload-error',
} as const;
