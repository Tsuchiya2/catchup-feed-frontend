import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Console textarea: same hairline/cyan-focus treatment as Input.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border border-console-line-3 bg-console-panel px-3 py-2 text-base text-console-ink transition-colors duration-[120ms] ease-out placeholder:text-console-ink-faint focus:border-console-cyan focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
