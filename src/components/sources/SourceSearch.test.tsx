import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceSearch, SourceSearchState, toSearchParams, hasActiveFilters } from './SourceSearch';

describe('SourceSearch', () => {
  const defaultSearchState: SourceSearchState = {
    keyword: '',
    category: null,
    active: null,
  };

  describe('Rendering', () => {
    it('should render with title', () => {
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByText('Search & Filter Sources')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByPlaceholderText('Search by name or URL...')).toBeInTheDocument();
    });

    it('should render category filter', () => {
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('should render active filter', () => {
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('should not show Clear All Filters button when no filters active', () => {
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.queryByRole('button', { name: 'Clear All Filters' })).not.toBeInTheDocument();
    });

    it('should show Clear All Filters button when filters are active', () => {
      const searchState = { ...defaultSearchState, keyword: 'test' };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SourceSearch
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
      const searchState = { ...defaultSearchState, keyword: 'Blog' };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByPlaceholderText('Search by name or URL...')).toHaveValue('Blog');
    });

    it('should display current category selection', () => {
      const searchState = { ...defaultSearchState, category: 'dev' };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Filter by category')).toHaveValue('dev');
    });

    it('should display current active selection (true)', () => {
      const searchState = { ...defaultSearchState, active: true };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toHaveValue('true');
    });

    it('should display current active selection (false)', () => {
      const searchState = { ...defaultSearchState, active: false };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toHaveValue('false');
    });
  });

  describe('State Changes', () => {
    it('should call onSearchChange when category changes (debounced)', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={onSearchChange} />);

      await user.type(screen.getByLabelText('Filter by category'), 'dev');

      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledWith({
          ...defaultSearchState,
          category: 'dev',
        });
      });
    });

    it('should call onSearchChange when active status changes', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={onSearchChange} />);

      await user.selectOptions(screen.getByLabelText('Status'), 'true');

      expect(onSearchChange).toHaveBeenCalledWith({
        ...defaultSearchState,
        active: true,
      });
    });

    it('should call onSearchChange when Clear All Filters is clicked', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      const searchState = { keyword: 'test', category: 'dev', active: true };
      render(<SourceSearch searchState={searchState} onSearchChange={onSearchChange} />);

      await user.click(screen.getByRole('button', { name: 'Clear All Filters' }));

      expect(onSearchChange).toHaveBeenCalledWith({
        keyword: '',
        category: null,
        active: null,
      });
    });
  });

  describe('Loading State', () => {
    it('should pass isLoading to search input', () => {
      render(
        <SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} isLoading={true} />
      );

      // The search input should show loading spinner
      const searchContainer = screen.getByPlaceholderText('Search by name or URL...').parentElement;
      expect(searchContainer?.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Clear All Filters Button Visibility', () => {
    it('should show Clear All when keyword is set', () => {
      const searchState = { ...defaultSearchState, keyword: 'test' };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should show Clear All when category is set', () => {
      const searchState = { ...defaultSearchState, category: 'dev' };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should show Clear All when active is true', () => {
      const searchState = { ...defaultSearchState, active: true };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('should show Clear All when active is false', () => {
      const searchState = { ...defaultSearchState, active: false };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });
  });
});

describe('toSearchParams', () => {
  it('should convert full state to params', () => {
    const state: SourceSearchState = {
      keyword: 'Blog',
      category: 'dev',
      active: true,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: 'Blog',
      category: 'dev',
      active: true,
    });
  });

  it('should omit empty values', () => {
    const state: SourceSearchState = {
      keyword: '',
      category: null,
      active: null,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: undefined,
      category: undefined,
      active: undefined,
    });
  });

  it('should handle partial state', () => {
    const state: SourceSearchState = {
      keyword: 'test',
      category: null,
      active: true,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: 'test',
      category: undefined,
      active: true,
    });
  });

  it('should handle active: false correctly', () => {
    const state: SourceSearchState = {
      keyword: '',
      category: null,
      active: false,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: undefined,
      category: undefined,
      active: false,
    });
  });
});

describe('hasActiveFilters', () => {
  it('should return false for empty state', () => {
    const state: SourceSearchState = {
      keyword: '',
      category: null,
      active: null,
    };

    expect(hasActiveFilters(state)).toBe(false);
  });

  it('should return true when keyword is set', () => {
    const state: SourceSearchState = {
      keyword: 'test',
      category: null,
      active: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when category is set', () => {
    const state: SourceSearchState = {
      keyword: '',
      category: 'dev',
      active: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when active is true', () => {
    const state: SourceSearchState = {
      keyword: '',
      category: null,
      active: true,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when active is false', () => {
    const state: SourceSearchState = {
      keyword: '',
      category: null,
      active: false,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when multiple filters are set', () => {
    const state: SourceSearchState = {
      keyword: 'test',
      category: 'dev',
      active: true,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });
});
