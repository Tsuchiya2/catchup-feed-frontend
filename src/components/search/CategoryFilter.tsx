/**
 * CategoryFilter Component
 *
 * Free-text filter for source category (the radio segment grouping unit,
 * e.g. "dev", "ai"). Debounced so typing does not fire a request per key.
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export interface CategoryFilterProps {
  /** Currently selected category (null = no filter) */
  value: string | null;
  /** Callback when the category filter changes */
  onChange: (category: string | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

/**
 * CategoryFilter component
 *
 * @example
 * ```tsx
 * const [category, setCategory] = useState<string | null>(null);
 *
 * <CategoryFilter value={category} onChange={setCategory} />
 * ```
 */
export function CategoryFilter({
  value,
  onChange,
  className,
  disabled = false,
  debounceMs = 300,
}: CategoryFilterProps) {
  const [inputValue, setInputValue] = React.useState(value ?? '');
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // Keep local state in sync when the value is changed externally
  // (e.g. "Clear All Filters"). Intentional external-value sync.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value ?? '');
  }, [value]);

  // Propagate debounced changes upward
  React.useEffect(() => {
    const normalized = debouncedValue.trim() || null;
    if (normalized !== value) {
      onChange(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor="category-filter" className="text-sm font-medium">
        Category
      </Label>
      <Input
        id="category-filter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="e.g., dev"
        disabled={disabled}
        aria-label="Filter by category"
      />
    </div>
  );
}
