import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ArticleSearch,
  ArticleSearchState,
  toSearchParams,
  hasActiveFilters,
} from './ArticleSearch';
import * as useSourcesModule from '@/hooks/useSources';

// Mock useSources hook (used by SourceFilter)
vi.mock('@/hooks/useSources', () => ({
  useSources: vi.fn(),
}));

describe('ArticleSearch', () => {
  const defaultSearchState: ArticleSearchState = {
    keyword: '',
    sourceId: null,
    fromDate: null,
    toDate: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSourcesModule.useSources).mockReturnValue({
      sources: [
        {
          id: 1,
          name: 'Tech Blog',
          feed_url: 'https://example.com/feed',
          active: true,
          last_crawled_at: null,
        },
        {
          id: 2,
          name: 'News Feed',
          feed_url: 'https://example.com/news',
          active: true,
          last_crawled_at: null,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render with title', () => {
      render(<ArticleSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByText('Search & Filter Articles')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ArticleSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByPlaceholderText('Search by title or summary...')).toBeInTheDocument();
    });

    it('should render source filter', () => {
      render(<ArticleSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Source')).toBeInTheDocument();
    });

    it('should render date range picker', () => {
      render(<ArticleSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('From')).toBeInTheDocument();
      expect(screen.getByLabelText('To')).toBeInTheDocument();
    });

    it('should not show Clear All Filters button when no filters active', () => {
      render(<ArticleSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.queryByRole('button', { name: 'Clear All Filters' })).not.toBeInTheDocument();
    });

    it('should show Clear All Filters button when filters are active', () => {
      const searchState = { ...defaultSearchState, keyword: 'test' };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ArticleSearch
          searchState={defaultSearchState}
          onSearchChange={vi.fn()}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Search State Display', () => {
    it('should display current keyword in search input', () => {
      const searchState = { ...defaultSearchState, keyword: 'React' };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByPlaceholderText('Search by title or summary...')).toHaveValue('React');
    });

    it('should display current source selection', () => {
      const searchState = { ...defaultSearchState, sourceId: 1 };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Source')).toHaveValue('1');
    });

    it('should display current date range', () => {
      const searchState = { ...defaultSearchState, fromDate: '2025-01-01', toDate: '2025-01-15' };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('From')).toHaveValue('2025-01-01');
      expect(screen.getByLabelText('To')).toHaveValue('2025-01-15');
    });
  });

  describe('State Changes', () => {
    it('should call onSearchChange when source changes', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(<ArticleSearch searchState={defaultSearchState} onSearchChange={onSearchChange} />);

      await user.selectOptions(screen.getByLabelText('Source'), '1');

      expect(onSearchChange).toHaveBeenCalledWith({
        ...defaultSearchState,
        sourceId: 1,
      });
    });

    it('should call onSearchChange when Clear All Filters is clicked', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      const searchState = {
        keyword: 'test',
        sourceId: 1,
        fromDate: '2025-01-01',
        toDate: '2025-01-15',
      };
      render(<ArticleSearch searchState={searchState} onSearchChange={onSearchChange} />);

      await user.click(screen.getByRole('button', { name: 'Clear All Filters' }));

      expect(onSearchChange).toHaveBeenCalledWith({
        keyword: '',
        sourceId: null,
        fromDate: null,
        toDate: null,
      });
    });
  });

  describe('Loading State', () => {
    it('should pass isLoading to search input', () => {
      render(
        <ArticleSearch searchState={defaultSearchState} onSearchChange={vi.fn()} isLoading={true} />
      );

      // The search input should show loading spinner
      const searchContainer = screen.getByPlaceholderText(
        'Search by title or summary...'
      ).parentElement;
      expect(searchContainer?.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Clear All Filters Button Visibility', () => {
    it('should show Clear All when keyword is set', () => {
      const searchState = { ...defaultSearchState, keyword: 'test' };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should show Clear All when sourceId is set', () => {
      const searchState = { ...defaultSearchState, sourceId: 1 };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should show Clear All when fromDate is set', () => {
      const searchState = { ...defaultSearchState, fromDate: '2025-01-01' };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should show Clear All when toDate is set', () => {
      const searchState = { ...defaultSearchState, toDate: '2025-01-15' };
      render(<ArticleSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });
  });
});

describe('toSearchParams', () => {
  it('should convert full state to params', () => {
    const state: ArticleSearchState = {
      keyword: 'React',
      sourceId: 1,
      fromDate: '2025-01-01',
      toDate: '2025-01-15',
    };

    expect(toSearchParams(state)).toEqual({
      keyword: 'React',
      source_id: 1,
      from: '2025-01-01',
      to: '2025-01-15',
    });
  });

  it('should omit empty values', () => {
    const state: ArticleSearchState = {
      keyword: '',
      sourceId: null,
      fromDate: null,
      toDate: null,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: undefined,
      source_id: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it('should handle partial state', () => {
    const state: ArticleSearchState = {
      keyword: 'test',
      sourceId: null,
      fromDate: '2025-01-01',
      toDate: null,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: 'test',
      source_id: undefined,
      from: '2025-01-01',
      to: undefined,
    });
  });
});

describe('hasActiveFilters', () => {
  it('should return false for empty state', () => {
    const state: ArticleSearchState = {
      keyword: '',
      sourceId: null,
      fromDate: null,
      toDate: null,
    };

    expect(hasActiveFilters(state)).toBe(false);
  });

  it('should return true when keyword is set', () => {
    const state: ArticleSearchState = {
      keyword: 'test',
      sourceId: null,
      fromDate: null,
      toDate: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when sourceId is set', () => {
    const state: ArticleSearchState = {
      keyword: '',
      sourceId: 1,
      fromDate: null,
      toDate: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when fromDate is set', () => {
    const state: ArticleSearchState = {
      keyword: '',
      sourceId: null,
      fromDate: '2025-01-01',
      toDate: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when toDate is set', () => {
    const state: ArticleSearchState = {
      keyword: '',
      sourceId: null,
      fromDate: null,
      toDate: '2025-01-15',
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when multiple filters are set', () => {
    const state: ArticleSearchState = {
      keyword: 'test',
      sourceId: 1,
      fromDate: '2025-01-01',
      toDate: '2025-01-15',
    };

    expect(hasActiveFilters(state)).toBe(true);
  });
});
