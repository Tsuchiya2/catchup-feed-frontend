/**
 * Viewer (read-only account, D-27) related constants
 */

/**
 * Validation limits for viewer fields.
 * Password bounds are BYTES (bcrypt limit), not characters.
 */
export const VIEWER_LIMITS = {
  /** Maximum length for viewer name */
  NAME_MAX_LENGTH: 255,
  /** Maximum length for viewer email */
  EMAIL_MAX_LENGTH: 255,
  /** Minimum password length in bytes (backend validation) */
  PASSWORD_MIN_BYTES: 8,
  /** Maximum password length in bytes (bcrypt input limit) */
  PASSWORD_MAX_BYTES: 72,
} as const;

/**
 * Test IDs for viewer-related components
 */
export const VIEWER_TEST_IDS = {
  /** Viewer card container */
  CARD: 'viewer-card',
  /** Name input field */
  NAME_INPUT: 'viewer-name-input',
  /** Email input field */
  EMAIL_INPUT: 'viewer-email-input',
  /** Password input field */
  PASSWORD_INPUT: 'viewer-password-input',
  /** Save button */
  SAVE_BUTTON: 'viewer-save-button',
  /** Cancel button */
  CANCEL_BUTTON: 'viewer-cancel-button',
  /** Edit button on a card */
  EDIT_BUTTON: 'viewer-edit-button',
  /** Activate/deactivate toggle button on a card */
  TOGGLE_ACTIVE_BUTTON: 'viewer-toggle-active-button',
  /** Delete button on a card */
  DELETE_BUTTON: 'viewer-delete-button',
  /** Delete confirmation dialog */
  DELETE_DIALOG: 'viewer-delete-dialog',
  /** Delete confirm button */
  DELETE_CONFIRM_BUTTON: 'viewer-delete-confirm-button',
} as const;
