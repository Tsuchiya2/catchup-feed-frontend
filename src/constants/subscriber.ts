/**
 * Subscriber (friend) related constants
 */

/**
 * Validation limits for subscriber fields
 */
export const SUBSCRIBER_LIMITS = {
  /** Maximum length for subscriber name */
  NAME_MAX_LENGTH: 255,
  /** Maximum length for subscriber email */
  EMAIL_MAX_LENGTH: 255,
  /** Maximum length for subscriber note */
  NOTE_MAX_LENGTH: 1000,
} as const;

/**
 * Test IDs for subscriber-related components
 */
export const SUBSCRIBER_TEST_IDS = {
  /** Subscriber card container */
  CARD: 'subscriber-card',
  /** Name input field */
  NAME_INPUT: 'subscriber-name-input',
  /** Email input field */
  EMAIL_INPUT: 'subscriber-email-input',
  /** Note input field */
  NOTE_INPUT: 'subscriber-note-input',
  /** Save button */
  SAVE_BUTTON: 'subscriber-save-button',
  /** Cancel button */
  CANCEL_BUTTON: 'subscriber-cancel-button',
  /** Edit button on a card */
  EDIT_BUTTON: 'subscriber-edit-button',
  /** Deactivate button on a card */
  DEACTIVATE_BUTTON: 'subscriber-deactivate-button',
  /** Deactivate confirmation dialog */
  DEACTIVATE_DIALOG: 'subscriber-deactivate-dialog',
  /** Deactivate confirm button */
  DEACTIVATE_CONFIRM_BUTTON: 'subscriber-deactivate-confirm-button',
  /** Token issue button */
  ISSUE_TOKEN_BUTTON: 'token-issue-button',
  /** One-time issued token dialog */
  ISSUED_TOKEN_DIALOG: 'issued-token-dialog',
  /** Feed URL display in the issued token dialog */
  ISSUED_TOKEN_FEED_URL: 'issued-token-feed-url',
  /** Copy feed URL button */
  COPY_FEED_URL_BUTTON: 'copy-feed-url-button',
  /** Revoke token button */
  REVOKE_TOKEN_BUTTON: 'token-revoke-button',
  /** Revoke confirmation dialog */
  REVOKE_DIALOG: 'token-revoke-dialog',
  /** Revoke confirm button */
  REVOKE_CONFIRM_BUTTON: 'token-revoke-confirm-button',
} as const;

/**
 * Neglect-detection thresholds for the access log summary (in days).
 * The project goal is feedback from friends: surface friends who have
 * quietly stopped listening.
 */
export const ACCESS_LOG_THRESHOLDS = {
  /** Show a warning when a friend has not accessed the feed for this many days */
  WARN_DAYS: 14,
  /** Show an alert (e.g. "3 weeks without access") at this many days */
  ALERT_DAYS: 21,
} as const;
