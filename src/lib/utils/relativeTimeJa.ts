/**
 * Japanese relative time formatter for the broadcast console UI.
 *
 * Returns compact mono-friendly strings like `11時間前` / `3日前`. Unknown,
 * invalid, and future dates degrade to `—` (README ローディング spec: mono
 * numeric positions show an em dash instead of fabricated values).
 */

/**
 * Formats an ISO 8601 timestamp as Japanese relative time.
 *
 * @param dateString - ISO 8601 date string, null, or undefined
 * @returns e.g. `たった今`, `42分前`, `11時間前`, `3日前`; dates 30 days or
 *   older become `YYYY.MM.DD`; invalid input becomes `—`
 */
export function formatRelativeTimeJa(dateString: string | null | undefined): string {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '—';
  }

  const diffMs = Date.now() - date.getTime();
  // Allow small clock skew; anything clearly in the future is unknowable.
  if (diffMs < -60_000) {
    return '—';
  }

  const minutes = Math.floor(Math.max(diffMs, 0) / 60_000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}
