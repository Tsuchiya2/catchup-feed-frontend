import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes by specified delay', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated' });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Advance timer by 299ms (just before debounce)
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(result.current).toBe('initial');

      // Advance timer by 1ms more (total 300ms)
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('should update value after delay expires', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
        initialProps: { value: 'first' },
      });

      rerender({ value: 'second' });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('second');
    });

    it('should cancel previous timeout on rapid changes', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'first' },
      });

      // Rapid changes
      rerender({ value: 'second' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'third' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'fourth' });

      // Not enough time passed for any update
      expect(result.current).toBe('first');

      // Wait full debounce time from last change
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only show final value
      expect(result.current).toBe('fourth');
    });
  });

  describe('Default Delay', () => {
    it('should use default delay of 300ms', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      // Before default delay
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(result.current).toBe('initial');

      // After default delay
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });
  });

  describe('Custom Delay Values', () => {
    it('should handle custom delay of 100ms', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle custom delay of 1000ms', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });
  });

  describe('Different Value Types', () => {
    it('should handle string values', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'hello' },
      });

      rerender({ value: 'world' });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('world');
    });

    it('should handle number values', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 42 },
      });

      rerender({ value: 100 });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(100);
    });

    it('should handle object values', () => {
      const initial = { name: 'John' };
      const updated = { name: 'Jane' };

      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: initial },
      });

      rerender({ value: updated });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toEqual(updated);
    });

    it('should handle null values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce<string | null>(value, 300),
        { initialProps: { value: 'initial' as string | null } }
      );

      rerender({ value: null });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(null);
    });

    it('should handle undefined values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce<string | undefined>(value, 300),
        { initialProps: { value: 'initial' as string | undefined } }
      );

      rerender({ value: undefined });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(undefined);
    });
  });

  describe('Cleanup on Unmount', () => {
    it('should cleanup timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('No Update If Value Does Not Change', () => {
    it('should not trigger update if value does not change', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
        initialProps: { value: 'same' },
      });

      rerender({ value: 'same' });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('same');
    });
  });

  describe('Multiple useDebounce Instances', () => {
    it('should handle multiple independent instances', () => {
      const { result: result1, rerender: rerender1 } = renderHook(
        ({ value }) => useDebounce(value, 200),
        { initialProps: { value: 'hook1-initial' } }
      );

      const { result: result2, rerender: rerender2 } = renderHook(
        ({ value }) => useDebounce(value, 400),
        { initialProps: { value: 'hook2-initial' } }
      );

      rerender1({ value: 'hook1-updated' });
      rerender2({ value: 'hook2-updated' });

      // After 200ms, hook1 should update but not hook2
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result1.current).toBe('hook1-updated');
      expect(result2.current).toBe('hook2-initial');

      // After 400ms total, hook2 should also update
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result1.current).toBe('hook1-updated');
      expect(result2.current).toBe('hook2-updated');
    });
  });
});
