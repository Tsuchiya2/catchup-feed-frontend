import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Console button (放送卓改訂版): square corners, no shadows/glow, 1px
 * hairline borders. Hover moves the background one step only; transitions
 * are limited to background/border color (README Interactions & Behavior).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-[120ms] ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /* Filled selection color: cyan on dark, near-black on light */
        default: 'bg-console-sel-bg font-bold text-console-sel-ink hover:bg-console-sel-hover',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover',
        outline:
          'border border-console-line-3 bg-transparent text-console-ink-sub hover:bg-console-hover',
        secondary:
          'border border-console-line-2 bg-console-panel text-console-ink-sub hover:bg-console-hover',
        ghost: 'text-console-ink-sub hover:bg-console-hover',
        link: 'text-console-cyan underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
