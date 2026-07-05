/**
 * Subscriber (friend) form validation
 *
 * Name is required; email and note are optional.
 */

import { SUBSCRIBER_LIMITS } from '@/constants/subscriber';

/**
 * Form data for subscriber create/edit
 */
export interface SubscriberFormData {
  name: string;
  email: string;
  note: string;
}

/**
 * Validation errors keyed by field
 */
export interface SubscriberFormErrors {
  name?: string;
  email?: string;
  note?: string;
}

/** Minimal email shape check (backend performs authoritative validation) */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the subscriber name (required, max length)
 */
export function validateSubscriberName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.length > SUBSCRIBER_LIMITS.NAME_MAX_LENGTH) {
    return `Maximum ${SUBSCRIBER_LIMITS.NAME_MAX_LENGTH} characters allowed`;
  }
  return undefined;
}

/**
 * Validate the subscriber email (optional; must look like an email if set)
 */
export function validateSubscriberEmail(email: string): string | undefined {
  if (!email || email.trim().length === 0) {
    return undefined;
  }
  if (email.length > SUBSCRIBER_LIMITS.EMAIL_MAX_LENGTH) {
    return `Maximum ${SUBSCRIBER_LIMITS.EMAIL_MAX_LENGTH} characters allowed`;
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return undefined;
}

/**
 * Validate the subscriber note (optional, max length)
 */
export function validateSubscriberNote(note: string): string | undefined {
  if (!note) {
    return undefined;
  }
  if (note.length > SUBSCRIBER_LIMITS.NOTE_MAX_LENGTH) {
    return `Maximum ${SUBSCRIBER_LIMITS.NOTE_MAX_LENGTH} characters allowed`;
  }
  return undefined;
}

/**
 * Validate the whole form; returns an empty object when valid
 */
export function validateSubscriberForm(data: SubscriberFormData): SubscriberFormErrors {
  const errors: SubscriberFormErrors = {};

  const nameError = validateSubscriberName(data.name);
  if (nameError) {
    errors.name = nameError;
  }

  const emailError = validateSubscriberEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  const noteError = validateSubscriberNote(data.note);
  if (noteError) {
    errors.note = noteError;
  }

  return errors;
}
