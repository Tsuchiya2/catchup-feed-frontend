/**
 * ActiveToggle Component
 *
 * Interactive toggle control for admin users to enable/disable sources.
 * Includes loading states, error handling, and accessibility features.
 */

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { NetworkError } from '@/lib/api/errors';

/**
 * Props for the ActiveToggle component
 */
interface ActiveToggleProps {
  /** Source ID */
  sourceId: number;
  /** Source name for accessibility labels */
  sourceName: string;
  /** Initial active status */
  initialActive: boolean;
  /** Callback when toggle is changed */
  onToggle: (sourceId: number, newActive: boolean) => Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get user-friendly error message from error object
 *
 * @param error - Error object
 * @returns User-friendly error message
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'この操作を行う権限がありません。';
    }
    if (error.status === 404) {
      return 'ソースが見つかりません。ページを再読み込みしてください。';
    }
    if (error.status >= 500) {
      return 'サーバーエラーです。しばらくしてからやり直してください。';
    }
  }
  if (error instanceof NetworkError) {
    return 'ネットワークエラーです。接続を確認してください。';
  }
  return 'ソースの状態を更新できませんでした。もう一度お試しください。';
}

/**
 * ActiveToggle Component
 *
 * Interactive toggle control for admin users to enable/disable sources.
 *
 * Memoized to prevent unnecessary re-renders, following the pattern
 * established by SourceCard and ArticleCard components.
 *
 * @example
 * ```tsx
 * <ActiveToggle
 *   sourceId={source.id}
 *   sourceName={source.name}
 *   initialActive={source.active}
 *   onToggle={handleToggle}
 * />
 * ```
 */
export const ActiveToggle = React.memo(function ActiveToggle({
  sourceId,
  sourceName,
  initialActive,
  onToggle,
  className,
}: ActiveToggleProps) {
  const [isToggling, setIsToggling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentActive, setCurrentActive] = React.useState(initialActive);

  /**
   * Handle toggle change
   * Implements optimistic update with rollback on error
   */
  const handleToggle = async (checked: boolean) => {
    // Store previous state for rollback
    const previousActive = currentActive;

    // Optimistic update
    setCurrentActive(checked);
    setIsToggling(true);
    setError(null);

    try {
      await onToggle(sourceId, checked);
    } catch (err) {
      // Revert to previous state on error
      setCurrentActive(previousActive);
      setError(getErrorMessage(err));
    } finally {
      setIsToggling(false);
    }
  };

  /**
   * Auto-dismiss error message after 5 seconds
   */
  React.useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Switch
          checked={currentActive}
          onCheckedChange={handleToggle}
          disabled={isToggling}
          aria-label={`${sourceName} の有効状態を切り替え`}
          aria-describedby={error ? `error-${sourceId}` : undefined}
        />
        {isToggling && <Loader2 className="h-4 w-4 animate-spin text-console-ink-faint" />}
      </div>

      {error && (
        <p
          id={`error-${sourceId}`}
          className="mt-1 font-mono text-[11px] text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});
