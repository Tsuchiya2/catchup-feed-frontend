/**
 * Formats a date string into a human-readable relative time format.
 *
 * @param dateString - ISO 8601 date string, null, or undefined
 * @returns A string representing the relative time (e.g., "5 minutes ago", "2 hours ago") or an error message
 *
 * @example
 * formatRelativeTime('2025-01-15T10:30:00Z') // "2 hours ago"
 * formatRelativeTime(null) // "Date unavailable"
 * formatRelativeTime('invalid-date') // "Date unavailable"
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Date unavailable';
  }

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  // Check for future dates (allow 1 hour tolerance for timezone issues)
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  if (date > oneHourFromNow) {
    return 'Scheduled';
  }

  // Calculate time differences
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Return appropriate relative time format
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;

  // For dates older than 7 days, show the actual date
  return date.toLocaleDateString();
}
