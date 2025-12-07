/**
 * ActiveFilter Component
 *
 * Dropdown filter for filtering by active/inactive status.
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ActiveFilterProps {
  /** Currently selected active status */
  value: boolean | null;
  /** Callback when status selection changes */
  onChange: (active: boolean | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the select */
  disabled?: boolean;
}

/**
 * ActiveFilter component
 *
 * @example
 * ```tsx
 * const [active, setActive] = useState<boolean | null>(null);
 *
 * <ActiveFilter
 *   value={active}
 *   onChange={setActive}
 * />
 * ```
 */
export function ActiveFilter({ value, onChange, className, disabled = false }: ActiveFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange(null);
    } else {
      onChange(selectedValue === 'true');
    }
  };

  // Convert boolean to string for select value
  const selectValue = value === null ? '' : value.toString();

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor="active-filter" className="text-sm font-medium">
        Status
      </Label>
      <select
        id="active-filter"
        value={selectValue}
        onChange={handleChange}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Filter by status"
      >
        <option value="">All</option>
        <option value="true">Active Only</option>
        <option value="false">Inactive Only</option>
      </select>
    </div>
  );
}
