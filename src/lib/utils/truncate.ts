/**
 * Truncates a text string to a maximum length, respecting word boundaries.
 * Adds ellipsis (...) to indicate truncation.
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the truncated text (excluding ellipsis)
 * @returns Truncated text with ellipsis if needed, or original text if shorter than maxLength
 *
 * @example
 * truncateText('This is a long sentence', 10) // "This is a..."
 * truncateText('Short', 10) // "Short"
 * truncateText('', 10) // ""
 * truncateText(null as any, 10) // ""
 */
export function truncateText(text: string, maxLength: number): string {
  // Handle null, undefined, or empty text
  if (!text || text.length === 0) return '';

  // If text is within limit, return as is
  if (text.length <= maxLength) return text;

  // Truncate at maxLength
  const truncated = text.substring(0, maxLength);

  // Find the last space to avoid cutting words
  // Only use word boundary if it's within 80% of maxLength to avoid over-truncation
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  // If no suitable space found, truncate at maxLength
  return truncated.trim() + '...';
}
