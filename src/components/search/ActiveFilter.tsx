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
      <Label
        htmlFor="active-filter"
        className="font-mono text-[11px] tracking-[.18em] text-console-ink-weak"
      >
        状態
      </Label>
      <select
        id="active-filter"
        value={selectValue}
        onChange={handleChange}
        disabled={disabled}
        className="console-field flex h-10 w-full disabled:cursor-not-allowed"
        aria-label="状態で絞り込む"
      >
        <option value="">すべて</option>
        <option value="true">有効のみ</option>
        <option value="false">無効のみ</option>
      </select>
    </div>
  );
}
