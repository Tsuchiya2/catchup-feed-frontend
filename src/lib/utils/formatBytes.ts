/**
 * Formats a byte count into a human-readable size string.
 *
 * @param bytes - Size in bytes, or null/undefined when unknown
 * @returns e.g. "1.5 MB", "820 KB", "-" when unavailable
 *
 * @example
 * formatBytes(1048576) // "1.0 MB"
 * formatBytes(null) // "-"
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return '-';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb >= 100 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  if (mb < 1024) {
    return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}
