'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * ConsoleClock — mono wall clock (`YYYY.MM.DD HH:mm`) for the status band.
 *
 * Renders `—` until mounted to avoid a server/client hydration mismatch,
 * then updates every 30 seconds.
 */
export function ConsoleClock({ className }: { className?: string }) {
  const [text, setText] = React.useState('—');

  React.useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const update = () => {
      const d = new Date();
      setText(
        `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
    };
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, []);

  return <span className={cn('font-mono', className)}>{text}</span>;
}
