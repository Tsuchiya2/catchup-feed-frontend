import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Console input (放送卓改訂版): hairline border, cyan focus border + cyan
 * outline with 2px offset (README フォーカス). 16px on phones to avoid the
 * iOS zoom, no border-radius, no glow.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full border border-console-line-3 bg-console-panel px-3 py-2 text-base text-console-ink transition-colors duration-[120ms] ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-console-ink placeholder:text-console-ink-faint focus:border-console-cyan focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
