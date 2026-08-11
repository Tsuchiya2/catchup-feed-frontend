import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Console empty state: hairline frame, quiet text — no illustration flair.
 */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-console-line-2 bg-console-panel px-6 py-12 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-console-ink-ghost">{icon}</div>}
      <h3 className="mb-2 text-[13.5px] font-bold text-console-ink">{title}</h3>
      {description && (
        <p className="mb-4 max-w-[420px] text-[12.5px] leading-[1.9] text-console-ink-weak [text-wrap:pretty]">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
