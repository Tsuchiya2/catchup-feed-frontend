import { cn } from '@/lib/utils';

/**
 * Console loading placeholder: a hairline frame with empty contents —
 * no same-surface pulse (README ローディング). Mono numerics elsewhere
 * degrade to `—`.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-console-line-2', className)} {...props} />;
}

export { Skeleton };
