/**
 * PageHeader Component (放送卓改訂版)
 *
 * Console panel heading: a small mono label with letter-spacing, an optional
 * mono sub line (counts, status), and an optional action on the right.
 * No glow, no large display type — pages read like console panels.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the PageHeader component
 */
interface PageHeaderProps {
  /** The main title of the page */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Optional action element (e.g., button) on the right side */
  action?: React.ReactNode;
  /** Additional CSS classes to apply */
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="font-mono text-[11px] tracking-[.2em] text-console-ink-weak">{title}</h1>
        {description && (
          <p className="mt-1.5 font-mono text-[11px] leading-[1.8] text-console-ink-faint">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
