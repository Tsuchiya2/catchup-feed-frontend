'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * Global Error Boundary
 *
 * Catches errors in the application and displays a user-friendly error page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="mb-2 text-2xl font-bold">Something went wrong!</h1>
        <p className="mb-6 text-muted-foreground">
          We apologize for the inconvenience. An unexpected error occurred.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 rounded-lg bg-muted p-4 text-left">
            <p className="text-sm font-mono text-muted-foreground">{error.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
