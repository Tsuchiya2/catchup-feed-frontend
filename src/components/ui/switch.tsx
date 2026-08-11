'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Square console toggle: 1px frame, filled thumb; checked = cyan
      // (README: state via border/label, radius 0, no glow).
      'peer inline-flex h-5 w-10 shrink-0 cursor-pointer items-center border border-console-line-3 bg-transparent transition-colors duration-[120ms] ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-console-cyan',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-3 w-3 translate-x-[3px] bg-console-ink-faint transition-transform duration-[120ms] ease-out data-[state=checked]:translate-x-[23px] data-[state=checked]:bg-console-cyan'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
