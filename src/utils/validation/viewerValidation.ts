/**
 * Viewer (read-only account, D-27) form validation
 *
 * Name and email are always required (email is the login identifier).
 * Password is required when creating; optional when editing (blank = keep
 * the current password). Password bounds are BYTES (bcrypt limit).
 */

import { VIEWER_LIMITS } from '@/constants/viewer';

/**
 * Form data for viewer create/edit
 */
export interface ViewerFormData {
  name: string;
  email: string;
  password: string;
}

/**
 * Validation errors keyed by field
 */
export interface ViewerFormErrors {
  name?: string;
  email?: string;
  password?: string;
}

/** Minimal email shape check (backend performs authoritative validation) */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the viewer name (required, max length)
 */
export function validateViewerName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.length > VIEWER_LIMITS.NAME_MAX_LENGTH) {
    return `Maximum ${VIEWER_LIMITS.NAME_MAX_LENGTH} characters allowed`;
  }
  return undefined;
}

/**
 * Validate the viewer email (required — it is the login identifier)
 */
export function validateViewerEmail(email: string): string | undefined {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  if (email.length > VIEWER_LIMITS.EMAIL_MAX_LENGTH) {
    return `Maximum ${VIEWER_LIMITS.EMAIL_MAX_LENGTH} characters allowed`;
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return undefined;
}

/**
 * Validate the viewer password.
 *
 * The backend bounds are in BYTES (8–72, the bcrypt input limit), so the
 * length is measured after UTF-8 encoding — multibyte characters count as
 * more than one.
 *
 * @param password - Raw password input
 * @param options.required - true for create mode; false for edit mode,
 *   where an empty password means "keep the current password"
 */
export function validateViewerPassword(
  password: string,
  options: { required: boolean }
): string | undefined {
  if (!password || password.length === 0) {
    return options.required ? 'Password is required' : undefined;
  }
  const bytes = new TextEncoder().encode(password).length;
  if (bytes < VIEWER_LIMITS.PASSWORD_MIN_BYTES) {
    return `Password must be at least ${VIEWER_LIMITS.PASSWORD_MIN_BYTES} bytes`;
  }
  if (bytes > VIEWER_LIMITS.PASSWORD_MAX_BYTES) {
    return `Password must be at most ${VIEWER_LIMITS.PASSWORD_MAX_BYTES} bytes`;
  }
  return undefined;
}

/**
 * Validate the whole form; returns an empty object when valid.
 *
 * @param data - Current form values
 * @param mode - 'create' requires a password; 'edit' allows leaving it blank
 */
export function validateViewerForm(
  data: ViewerFormData,
  mode: 'create' | 'edit'
): ViewerFormErrors {
  const errors: ViewerFormErrors = {};

  const nameError = validateViewerName(data.name);
  if (nameError) {
    errors.name = nameError;
  }

  const emailError = validateViewerEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validateViewerPassword(data.password, { required: mode === 'create' });
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}
