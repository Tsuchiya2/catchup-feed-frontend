import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Console status label (放送卓改訂版): state is shown with a mono label and
 * a 1px border — never a fill (design handoff 未着手の画面 guidance).
 */
const badgeVariants = cva(
  'inline-flex items-center border px-2 py-0.5 font-mono text-[10.5px] tracking-[.12em]',
  {
    variants: {
      variant: {
        default: 'border-console-line-3 text-console-ink-sub',
        secondary: 'border-console-line-2 text-console-ink-faint',
        success: 'border-console-cyan text-console-cyan',
        warn: 'border-console-warn text-console-warn',
        destructive: 'border-destructive text-destructive',
        outline: 'border-console-line-3 text-console-ink-weak',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
