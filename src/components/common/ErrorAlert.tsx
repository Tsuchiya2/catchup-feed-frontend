'use client';

import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

/**
 * ErrorAlert Component Props
 */
interface ErrorAlertProps {
  /** Error object to display. If null, component renders nothing */
  error: Error | null;
  /** Optional callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Optional title for the alert */
  title?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * ErrorAlert Component
 *
 * A reusable error display component that shows an alert with an error message.
 * Renders nothing when error is null.
 *
 * Features:
 * - Displays error message from Error object
 * - Optional dismiss button
 * - Customizable title
 * - Accessible with role="alert" and aria-live="polite"
 *
 * @example
 * ```tsx
 * <ErrorAlert
 *   error={new Error('Failed to save')}
 *   title="Save Error"
 *   onDismiss={() => clearError()}
 * />
 * ```
 */
export function ErrorAlert({ error, onDismiss, title = 'エラー', className }: ErrorAlertProps) {
  // Don't render if there's no error
  if (!error) return null;

  return (
    <Alert
      variant="destructive"
      role="alert"
      aria-live="polite"
      className={cn('relative', className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 p-1 opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
          aria-label="エラーを閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}
