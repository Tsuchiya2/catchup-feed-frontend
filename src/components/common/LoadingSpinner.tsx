import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /**
   * The variant of the spinner
   * - 'centered': Full-page centered spinner
   * - 'inline': Inline spinner for buttons or text
   */
  variant?: 'centered' | 'inline';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({
  variant = 'inline',
  className,
  size = 'md',
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (variant === 'centered') {
    return <div className="flex min-h-[200px] items-center justify-center">{spinner}</div>;
  }

  return spinner;
}
