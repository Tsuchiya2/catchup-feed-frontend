/**
 * SearchInput Component
 *
 * Reusable search input with debounce, loading indicator, and clear button.
 * Used in ArticleSearch and SourceSearch components.
 */

'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when value changes (debounced) */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether search is in progress */
  isLoading?: boolean;
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number;
  /** Additional CSS classes */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
}

/**
 * SearchInput component with debouncing and loading indicator
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 *
 * <SearchInput
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Search articles..."
 *   isLoading={isSearching}
 * />
 * ```
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  isLoading = false,
  debounceDelay = 300,
  className,
  disabled = false,
}: SearchInputProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const debouncedValue = useDebounce(inputValue, debounceDelay);
  // Last value communicated with the parent (either received via props or
  // emitted through onChange). Guards against re-emitting a stale debounced
  // value when the parent changes `value` externally (e.g. "Clear All
  // Filters"), which used to instantly restore the cleared keyword.
  const lastSyncedValue = React.useRef(value);

  // Sync with external value changes. Intentional external-value sync.
  React.useEffect(() => {
    lastSyncedValue.current = value;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value);
  }, [value]);

  // Previous debounced value: the notify effect below re-runs whenever the
  // parent re-creates `onChange`, so it must ignore runs where the debounced
  // value itself did not change (otherwise a stale value still inside the
  // debounce window would be re-emitted).
  const prevDebouncedValue = React.useRef(debouncedValue);

  // Notify parent when debounced value changes
  React.useEffect(() => {
    if (debouncedValue === prevDebouncedValue.current) {
      return;
    }
    prevDebouncedValue.current = debouncedValue;
    if (debouncedValue !== lastSyncedValue.current) {
      lastSyncedValue.current = debouncedValue;
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = React.useCallback(() => {
    setInputValue('');
    onChange('');
  }, [onChange]);

  const showClearButton = React.useMemo(
    () => inputValue.length > 0 && !isLoading,
    [inputValue, isLoading]
  );

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Search className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-10 pr-10"
        aria-label={placeholder}
      />
      {showClearButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
