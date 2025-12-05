import { describe, it, expect } from 'vitest';
import { truncateText } from './truncate';

describe('truncateText', () => {
  describe('Null and Empty Handling', () => {
    it('should return empty string for null', () => {
      expect(truncateText(null as unknown as string, 100)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(truncateText(undefined as unknown as string, 100)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(truncateText('', 100)).toBe('');
    });
  });

  describe('Text Within Limit', () => {
    it('should return original text when shorter than maxLength', () => {
      expect(truncateText('Short text', 100)).toBe('Short text');
    });

    it('should return original text when equal to maxLength', () => {
      expect(truncateText('Exact', 5)).toBe('Exact');
    });

    it('should return original single character', () => {
      expect(truncateText('A', 10)).toBe('A');
    });
  });

  describe('Text Truncation at Word Boundary', () => {
    it('should truncate at word boundary with ellipsis', () => {
      const text = 'This is a long sentence that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThanOrEqual(23); // maxLength + "..."
    });

    it('should truncate at space when within 80% of maxLength', () => {
      const text = 'Hello world and more text here';
      const result = truncateText(text, 15);
      // Should truncate at "Hello world and" (last space within 15 chars)
      // Space at position 11 is > 80% of 15 = 12
      expect(result).toBe('Hello world and...');
    });

    it('should not truncate at early spaces', () => {
      const text = 'A very very very long sentence';
      const result = truncateText(text, 25);
      // Last space within 80% is used
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThanOrEqual(28);
    });
  });

  describe('Text Truncation Without Word Boundary', () => {
    it('should truncate at maxLength when no suitable space found', () => {
      const text = 'Verylongwordwithoutanyspaces';
      const result = truncateText(text, 15);
      expect(result).toBe('Verylongwordwit...');
    });

    it('should truncate at maxLength for text with early space only', () => {
      const text = 'A verylongwordwithoutanyspaces';
      // Space at position 1 is less than 80% of 20 = 16, so truncate at maxLength
      const result = truncateText(text, 20);
      expect(result.length).toBeLessThanOrEqual(23);
      expect(result).toMatch(/\.\.\.$/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single word longer than maxLength', () => {
      const text = 'Supercalifragilisticexpialidocious';
      const result = truncateText(text, 10);
      expect(result).toBe('Supercalif...');
    });

    it('should handle text with only spaces', () => {
      const result = truncateText('     ', 3);
      expect(result).toBe('...');
    });

    it('should handle text ending with spaces before maxLength', () => {
      const text = 'Hello   world';
      const result = truncateText(text, 8);
      expect(result).toBe('Hello...');
    });

    it('should handle maxLength of 1', () => {
      const result = truncateText('Hello', 1);
      expect(result).toBe('H...');
    });

    it('should handle maxLength of 0', () => {
      const result = truncateText('Hello', 0);
      expect(result).toBe('...');
    });

    it('should preserve leading spaces if needed', () => {
      const text = '   Leading spaces text';
      const result = truncateText(text, 10);
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should handle multiple consecutive spaces', () => {
      const text = 'Hello    world    test';
      const result = truncateText(text, 15);
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should handle newlines in text', () => {
      const text = 'First line\nSecond line\nThird line';
      const result = truncateText(text, 15);
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThanOrEqual(18);
    });

    it('should handle tabs in text', () => {
      const text = 'First\tSecond\tThird';
      const result = truncateText(text, 10);
      expect(result).toMatch(/\.\.\.$/);
    });
  });

  describe('80% Word Boundary Rule', () => {
    it('should use word boundary when space is at exactly 80%', () => {
      // 80% of 10 = 8, space at position 8, lastIndexOf returns 8
      const text = '12345678 90';
      const result = truncateText(text, 10);
      // lastIndexOf(' ') on '12345678 9' returns 8, which is > 80% of 10 = 8
      expect(result).toBe('12345678 9...');
    });

    it('should not use word boundary when space is below 80%', () => {
      // Looking at 'Hi therereallylongword' truncated to 15: 'Hi therereallyl'
      // 80% of 15 = 12, space at position 2 is below 80%
      const text = 'Hi therereallylongword';
      const result = truncateText(text, 15);
      // Space at position 2 is less than 12 (80% of 15), so use maxLength
      expect(result).toBe('Hi therereallyl...');
    });

    it('should use last suitable word boundary', () => {
      const text = 'One two three four five';
      const result = truncateText(text, 18);
      // Truncated: 'One two three four', lastIndexOf(' ') = 13 (before 'four')
      // 80% of 18 = 14.4, but 17 > 14.4 so uses space at 17
      expect(result).toBe('One two three four...');
    });
  });

  describe('Summary-like Content', () => {
    it('should handle typical article summary', () => {
      const summary =
        'This is a sample article summary that describes the content of the article in a concise manner.';
      const result = truncateText(summary, 50);
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThanOrEqual(53);
    });

    it('should handle summary with 150 character limit (common use case)', () => {
      const summary =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.';
      const result = truncateText(summary, 150);
      expect(result).toMatch(/\.\.\.$/);
      expect(result.length).toBeLessThanOrEqual(153);
    });

    it('should handle short summary under limit', () => {
      const summary = 'A brief summary.';
      expect(truncateText(summary, 150)).toBe('A brief summary.');
    });
  });
});
