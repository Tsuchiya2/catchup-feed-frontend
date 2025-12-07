/**
 * SourceFilter Component
 *
 * Dropdown filter for selecting a source to filter articles.
 * Fetches available sources from the API.
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSources } from '@/hooks/useSources';

export interface SourceFilterProps {
  /** Currently selected source ID */
  value: number | null;
  /** Callback when source selection changes */
  onChange: (sourceId: number | null) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the select */
  disabled?: boolean;
}

/**
 * SourceFilter component
 *
 * @example
 * ```tsx
 * const [sourceId, setSourceId] = useState<number | null>(null);
 *
 * <SourceFilter
 *   value={sourceId}
 *   onChange={setSourceId}
 * />
 * ```
 */
export function SourceFilter({ value, onChange, className, disabled = false }: SourceFilterProps) {
  const { sources, isLoading } = useSources();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue ? parseInt(selectedValue, 10) : null);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor="source-filter" className="text-sm font-medium">
        Source
      </Label>
      <select
        id="source-filter"
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled || isLoading}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Filter by source"
      >
        <option value="">All Sources</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>
    </div>
  );
}
