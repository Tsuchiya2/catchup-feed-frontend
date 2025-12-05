import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from './formatDate';

describe('formatRelativeTime', () => {
  // Mock the current time for consistent testing
  const NOW = new Date('2025-01-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Null and Undefined Handling', () => {
    it('should return "Date unavailable" for null', () => {
      expect(formatRelativeTime(null)).toBe('Date unavailable');
    });

    it('should return "Date unavailable" for undefined', () => {
      expect(formatRelativeTime(undefined)).toBe('Date unavailable');
    });

    it('should return "Date unavailable" for empty string', () => {
      expect(formatRelativeTime('')).toBe('Date unavailable');
    });
  });

  describe('Invalid Date Handling', () => {
    it('should return "Date unavailable" for invalid date string', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Date unavailable');
    });

    it('should return "Date unavailable" for malformed date', () => {
      expect(formatRelativeTime('not-a-date-at-all')).toBe('Date unavailable');
    });

    it('should parse year-only date as valid (January 1st)', () => {
      // JavaScript Date constructor parses '2025' as a valid date (January 1, 2025)
      const result = formatRelativeTime('2025');
      // Should return a formatted date since '2025' is parsed as a valid old date
      expect(result).not.toBe('Date unavailable');
    });
  });

  describe('Future Date Handling', () => {
    it('should return "Scheduled" for dates more than 1 hour in the future', () => {
      const twoHoursLater = new Date(NOW.getTime() + 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursLater.toISOString())).toBe('Scheduled');
    });

    it('should return relative time for dates within 1 hour tolerance', () => {
      const halfHourLater = new Date(NOW.getTime() + 30 * 60 * 1000);
      // Within tolerance, so it should show relative time (approximately 0 minutes ago or "Just now")
      expect(formatRelativeTime(halfHourLater.toISOString())).toBe('Just now');
    });
  });

  describe('Just Now (less than 1 minute)', () => {
    it('should return "Just now" for current time', () => {
      expect(formatRelativeTime(NOW.toISOString())).toBe('Just now');
    });

    it('should return "Just now" for 30 seconds ago', () => {
      const thirtySecondsAgo = new Date(NOW.getTime() - 30 * 1000);
      expect(formatRelativeTime(thirtySecondsAgo.toISOString())).toBe('Just now');
    });

    it('should return "Just now" for 59 seconds ago', () => {
      const fiftyNineSecondsAgo = new Date(NOW.getTime() - 59 * 1000);
      expect(formatRelativeTime(fiftyNineSecondsAgo.toISOString())).toBe('Just now');
    });
  });

  describe('Minutes Ago (1-59 minutes)', () => {
    it('should return "1 minute ago" for exactly 1 minute ago', () => {
      const oneMinuteAgo = new Date(NOW.getTime() - 60 * 1000);
      expect(formatRelativeTime(oneMinuteAgo.toISOString())).toBe('1 minute ago');
    });

    it('should return "2 minutes ago" for 2 minutes ago', () => {
      const twoMinutesAgo = new Date(NOW.getTime() - 2 * 60 * 1000);
      expect(formatRelativeTime(twoMinutesAgo.toISOString())).toBe('2 minutes ago');
    });

    it('should return "45 minutes ago" for 45 minutes ago', () => {
      const fortyFiveMinutesAgo = new Date(NOW.getTime() - 45 * 60 * 1000);
      expect(formatRelativeTime(fortyFiveMinutesAgo.toISOString())).toBe('45 minutes ago');
    });

    it('should return "59 minutes ago" for 59 minutes ago', () => {
      const fiftyNineMinutesAgo = new Date(NOW.getTime() - 59 * 60 * 1000);
      expect(formatRelativeTime(fiftyNineMinutesAgo.toISOString())).toBe('59 minutes ago');
    });
  });

  describe('Hours Ago (1-23 hours)', () => {
    it('should return "1 hour ago" for exactly 1 hour ago', () => {
      const oneHourAgo = new Date(NOW.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('1 hour ago');
    });

    it('should return "2 hours ago" for 2 hours ago', () => {
      const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2 hours ago');
    });

    it('should return "12 hours ago" for 12 hours ago', () => {
      const twelveHoursAgo = new Date(NOW.getTime() - 12 * 60 * 60 * 1000);
      expect(formatRelativeTime(twelveHoursAgo.toISOString())).toBe('12 hours ago');
    });

    it('should return "23 hours ago" for 23 hours ago', () => {
      const twentyThreeHoursAgo = new Date(NOW.getTime() - 23 * 60 * 60 * 1000);
      expect(formatRelativeTime(twentyThreeHoursAgo.toISOString())).toBe('23 hours ago');
    });
  });

  describe('Days Ago (1-6 days)', () => {
    it('should return "1 day ago" for exactly 1 day ago', () => {
      const oneDayAgo = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneDayAgo.toISOString())).toBe('1 day ago');
    });

    it('should return "2 days ago" for 2 days ago', () => {
      const twoDaysAgo = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('2 days ago');
    });

    it('should return "5 days ago" for 5 days ago', () => {
      const fiveDaysAgo = new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(fiveDaysAgo.toISOString())).toBe('5 days ago');
    });

    it('should return "6 days ago" for 6 days ago', () => {
      const sixDaysAgo = new Date(NOW.getTime() - 6 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(sixDaysAgo.toISOString())).toBe('6 days ago');
    });
  });

  describe('Older Dates (7+ days)', () => {
    it('should return formatted date for 7 days ago', () => {
      const sevenDaysAgo = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(sevenDaysAgo.toISOString());
      // Should return a formatted date string, not relative time
      expect(result).not.toMatch(/days? ago/);
      expect(result).toMatch(/\d/); // Should contain numbers (date format)
    });

    it('should return formatted date for 30 days ago', () => {
      const thirtyDaysAgo = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(thirtyDaysAgo.toISOString());
      expect(result).not.toMatch(/days? ago/);
      expect(result).toMatch(/\d/);
    });

    it('should return formatted date for dates from last year', () => {
      const lastYear = new Date(NOW.getTime() - 365 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(lastYear.toISOString());
      expect(result).not.toMatch(/days? ago/);
      expect(result).toMatch(/\d/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle ISO 8601 date format with Z timezone', () => {
      const oneHourAgo = new Date(NOW.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('1 hour ago');
    });

    it('should handle dates with timezone offset', () => {
      // Create a date 1 hour ago and format it with a +00:00 offset
      const oneHourAgo = new Date(NOW.getTime() - 60 * 60 * 1000);
      const dateWithOffset = oneHourAgo.toISOString().replace('Z', '+00:00');
      expect(formatRelativeTime(dateWithOffset)).toBe('1 hour ago');
    });

    it('should handle exact boundary between minutes and hours', () => {
      const sixtyMinutesAgo = new Date(NOW.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(sixtyMinutesAgo.toISOString())).toBe('1 hour ago');
    });

    it('should handle exact boundary between hours and days', () => {
      const twentyFourHoursAgo = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twentyFourHoursAgo.toISOString())).toBe('1 day ago');
    });
  });
});
