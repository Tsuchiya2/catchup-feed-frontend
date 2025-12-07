import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useSourceSearch } from './useSourceSearch';
import * as sourceApi from '@/lib/api/endpoints/sources';
import type { Source } from '@/types/api';

// Mock the sources API
vi.mock('@/lib/api/endpoints/sources', () => ({
  searchSources: vi.fn(),
}));

describe('useSourceSearch', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    Wrapper.displayName = 'TestQueryClientProvider';
    return Wrapper;
  };

  const createMockSource = (overrides: Partial<Source> = {}): Source => ({
    id: 1,
    name: 'Test Source',
    feed_url: 'https://example.com/feed.xml',
    active: true,
    last_crawled_at: new Date().toISOString(),
    ...overrides,
  });

  const createMockSources = (count: number): Source[] =>
    Array.from({ length: count }, (_, i) =>
      createMockSource({
        id: i + 1,
        name: `Test Source ${i + 1}`,
      })
    );

  const mockSources = createMockSources(5);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Basic Functionality', () => {
    it('should fetch sources with search params', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const params = { keyword: 'Tech' };
      const { result } = renderHook(() => useSourceSearch(params), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sources).toEqual(mockSources);
      expect(sourceApi.searchSources).toHaveBeenCalledWith(params);
    });

    it('should return empty array when no data', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue([]);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'nonexistent' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sources).toEqual([]);
    });
  });

  describe('Search Parameters', () => {
    it('should handle keyword search', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'Blog' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith({ keyword: 'Blog' });
    });

    it('should handle source_type filter', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ source_type: 'RSS' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith({ source_type: 'RSS' });
    });

    it('should handle active status filter', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ active: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith({ active: true });
    });

    it('should handle inactive status filter', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue([]);

      const { result } = renderHook(() => useSourceSearch({ active: false }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith({ active: false });
    });

    it('should handle combined filters', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const params = {
        keyword: 'Tech',
        source_type: 'RSS',
        active: true,
      };
      const { result } = renderHook(() => useSourceSearch(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith(params);
    });

    it('should handle undefined params', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Search failed');
      vi.mocked(sourceApi.searchSources).mockRejectedValue(error);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      expect(result.current.error).toEqual(error);
      expect(result.current.sources).toEqual([]);
    });

    it('should retry once on failure', async () => {
      const error = new Error('Network error');
      vi.mocked(sourceApi.searchSources)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // React Query retries once, so it should succeed
      expect(result.current.sources).toEqual(mockSources);
    });
  });

  describe('Enabled Option', () => {
    it('should not fetch when enabled is false', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(
        () => useSourceSearch({ keyword: 'test' }, { enabled: false }),
        { wrapper: createWrapper() }
      );

      // Should not be loading because query is disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.sources).toEqual([]);
      expect(sourceApi.searchSources).not.toHaveBeenCalled();
    });

    it('should fetch when enabled is true', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }, { enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sources).toEqual(mockSources);
      expect(sourceApi.searchSources).toHaveBeenCalled();
    });

    it('should default enabled to true', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalled();
    });
  });

  describe('Caching', () => {
    it('should cache results with same params', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const params = { keyword: 'Tech' };
      const { result, rerender } = renderHook(() => useSourceSearch(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Rerender with same params
      rerender();

      // Should not fetch again immediately
      expect(sourceApi.searchSources).toHaveBeenCalledTimes(1);
    });

    it('should use different cache keys for different params', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result, rerender } = renderHook(({ params }) => useSourceSearch(params), {
        wrapper: createWrapper(),
        initialProps: { params: { keyword: 'Tech' } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change params
      rerender({ params: { keyword: 'Blog' } });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledWith({ keyword: 'Tech' });
      expect(sourceApi.searchSources).toHaveBeenCalledWith({ keyword: 'Blog' });
    });
  });

  describe('Refetch Function', () => {
    it('should provide refetch function', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch when refetch is called', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sourceApi.searchSources).toHaveBeenCalledTimes(1);

      result.current.refetch();

      await waitFor(() => {
        expect(sourceApi.searchSources).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Return Type', () => {
    it('should return correct shape', async () => {
      vi.mocked(sourceApi.searchSources).mockResolvedValue(mockSources);

      const { result } = renderHook(() => useSourceSearch({ keyword: 'test' }), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('sources');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });
  });
});
