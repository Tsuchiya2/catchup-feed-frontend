/**
 * StatusBadge Component
 *
 * Displays an Active/Inactive status badge with appropriate styling.
 * Uses success variant for active and secondary for inactive.
 */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Props for the StatusBadge component
 */
interface StatusBadgeProps {
  /** Whether the status is active */
  active: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatusBadge displays an Active or Inactive badge.
 *
 * @example
 * ```tsx
 * <StatusBadge active={true} />  // Shows "Active" with green styling
 * <StatusBadge active={false} /> // Shows "Inactive" with gray styling
 * ```
 */
export function StatusBadge({ active, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? 'success' : 'secondary'}
      className={cn('', className)}
      aria-label={`Status: ${active ? 'Active' : 'Inactive'}`}
    >
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}
