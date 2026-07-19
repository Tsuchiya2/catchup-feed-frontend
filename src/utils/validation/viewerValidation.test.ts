import { describe, it, expect } from 'vitest';
import {
  validateViewerName,
  validateViewerEmail,
  validateViewerPassword,
  validateViewerForm,
} from './viewerValidation';
import { VIEWER_LIMITS } from '@/constants/viewer';

describe('validateViewerName', () => {
  it('accepts a normal name', () => {
    expect(validateViewerName('Alice')).toBeUndefined();
  });

  it('rejects empty and whitespace-only names', () => {
    expect(validateViewerName('')).toBe('Name is required');
    expect(validateViewerName('   ')).toBe('Name is required');
  });

  it('rejects names over the max length', () => {
    const long = 'a'.repeat(VIEWER_LIMITS.NAME_MAX_LENGTH + 1);
    expect(validateViewerName(long)).toContain('Maximum');
  });
});

describe('validateViewerEmail', () => {
  it('rejects empty (email is the login identifier and required)', () => {
    expect(validateViewerEmail('')).toBe('Email is required');
  });

  it('accepts a valid email', () => {
    expect(validateViewerEmail('alice@example.com')).toBeUndefined();
  });

  it('rejects malformed emails', () => {
    expect(validateViewerEmail('not-an-email')).toBe('Please enter a valid email address');
    expect(validateViewerEmail('a@b')).toBe('Please enter a valid email address');
  });

  it('rejects emails over the max length', () => {
    const long = `${'a'.repeat(VIEWER_LIMITS.EMAIL_MAX_LENGTH)}@example.com`;
    expect(validateViewerEmail(long)).toContain('Maximum');
  });
});

describe('validateViewerPassword', () => {
  it('requires a password in create mode', () => {
    expect(validateViewerPassword('', { required: true })).toBe('Password is required');
  });

  it('allows blank in edit mode (keep current password)', () => {
    expect(validateViewerPassword('', { required: false })).toBeUndefined();
  });

  it('accepts a password within the byte bounds', () => {
    expect(validateViewerPassword('correct-horse', { required: true })).toBeUndefined();
  });

  it('rejects passwords under the minimum bytes', () => {
    expect(validateViewerPassword('short12', { required: true })).toContain('at least');
  });

  it('rejects passwords over the maximum bytes', () => {
    const long = 'a'.repeat(VIEWER_LIMITS.PASSWORD_MAX_BYTES + 1);
    expect(validateViewerPassword(long, { required: true })).toContain('at most');
  });

  it('measures length in UTF-8 BYTES, not characters (bcrypt limit)', () => {
    // 3 multibyte chars (3 bytes each in UTF-8) = 9 bytes >= 8: valid
    expect(validateViewerPassword('あいう', { required: true })).toBeUndefined();
    // 24 chars x 3 bytes = 72 bytes: exactly at the limit
    expect(validateViewerPassword('あ'.repeat(24), { required: true })).toBeUndefined();
    // 25 chars x 3 bytes = 75 bytes: over the limit despite only 25 chars
    expect(validateViewerPassword('あ'.repeat(25), { required: true })).toContain('at most');
  });
});

describe('validateViewerForm', () => {
  it('returns an empty object for valid create data', () => {
    expect(
      validateViewerForm(
        { name: 'Alice', email: 'alice@example.com', password: 'correct-horse' },
        'create'
      )
    ).toEqual({});
  });

  it('allows blank password in edit mode', () => {
    expect(
      validateViewerForm({ name: 'Alice', email: 'alice@example.com', password: '' }, 'edit')
    ).toEqual({});
  });

  it('collects errors per field', () => {
    const errors = validateViewerForm({ name: '', email: 'bad', password: '' }, 'create');
    expect(errors.name).toBe('Name is required');
    expect(errors.email).toBe('Please enter a valid email address');
    expect(errors.password).toBe('Password is required');
  });
});
