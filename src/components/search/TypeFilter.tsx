/**
 * TypeFilter Component
 *
 * Dropdown filter for selecting source type (RSS, Webflow, NextJS, Remix).
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Available source types */
const SOURCE_TYPES = ['RSS', 'Webflow', 'NextJS', 'Remix'] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export interface TypeFilterProps {
  /** Currently selected source type */
  value: string | null;
  /** Callback when type selection changes */
  onChange: (type: string | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the select */
  disabled?: boolean;
}

/**
 * TypeFilter component
 *
 * @example
 * ```tsx
 * const [sourceType, setSourceType] = useState<string | null>(null);
 *
 * <TypeFilter
 *   value={sourceType}
 *   onChange={setSourceType}
 * />
 * ```
 */
export function TypeFilter({ value, onChange, className, disabled = false }: TypeFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue || null);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor="type-filter" className="text-sm font-medium">
        Type
      </Label>
      <select
        id="type-filter"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Filter by source type"
      >
        <option value="">All Types</option>
        {SOURCE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}
