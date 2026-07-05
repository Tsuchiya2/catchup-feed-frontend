import { describe, it, expect } from 'vitest';
import {
  validateSubscriberName,
  validateSubscriberEmail,
  validateSubscriberNote,
  validateSubscriberForm,
} from './subscriberValidation';
import { SUBSCRIBER_LIMITS } from '@/constants/subscriber';

describe('validateSubscriberName', () => {
  it('accepts a normal name', () => {
    expect(validateSubscriberName('Taro')).toBeUndefined();
  });

  it('rejects empty and whitespace-only names', () => {
    expect(validateSubscriberName('')).toBe('Name is required');
    expect(validateSubscriberName('   ')).toBe('Name is required');
  });

  it('rejects names over the max length', () => {
    const long = 'a'.repeat(SUBSCRIBER_LIMITS.NAME_MAX_LENGTH + 1);
    expect(validateSubscriberName(long)).toContain('Maximum');
  });
});

describe('validateSubscriberEmail', () => {
  it('accepts empty (email is optional)', () => {
    expect(validateSubscriberEmail('')).toBeUndefined();
  });

  it('accepts a valid email', () => {
    expect(validateSubscriberEmail('taro@example.com')).toBeUndefined();
  });

  it('rejects malformed emails', () => {
    expect(validateSubscriberEmail('not-an-email')).toBe('Please enter a valid email address');
    expect(validateSubscriberEmail('a@b')).toBe('Please enter a valid email address');
  });

  it('rejects emails over the max length', () => {
    const long = `${'a'.repeat(SUBSCRIBER_LIMITS.EMAIL_MAX_LENGTH)}@example.com`;
    expect(validateSubscriberEmail(long)).toContain('Maximum');
  });
});

describe('validateSubscriberNote', () => {
  it('accepts empty (note is optional)', () => {
    expect(validateSubscriberNote('')).toBeUndefined();
  });

  it('rejects notes over the max length', () => {
    const long = 'a'.repeat(SUBSCRIBER_LIMITS.NOTE_MAX_LENGTH + 1);
    expect(validateSubscriberNote(long)).toContain('Maximum');
  });
});

describe('validateSubscriberForm', () => {
  it('returns an empty object for valid data', () => {
    expect(
      validateSubscriberForm({ name: 'Taro', email: 'taro@example.com', note: 'friend' })
    ).toEqual({});
  });

  it('collects errors per field', () => {
    const errors = validateSubscriberForm({ name: '', email: 'bad', note: '' });
    expect(errors.name).toBe('Name is required');
    expect(errors.email).toBe('Please enter a valid email address');
    expect(errors.note).toBeUndefined();
  });
});
