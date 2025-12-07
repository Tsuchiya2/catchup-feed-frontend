import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceSearch, SourceSearchState, toSearchParams, hasActiveFilters } from './SourceSearch';

describe('SourceSearch', () => {
  const defaultSearchState: SourceSearchState = {
    keyword: '',
    sourceType: null,
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

    it('should render type filter', () => {
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Type')).toBeInTheDocument();
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

    it('should display current type selection', () => {
      const searchState = { ...defaultSearchState, sourceType: 'RSS' };
      render(<SourceSearch searchState={searchState} onSearchChange={vi.fn()} />);

      expect(screen.getByLabelText('Type')).toHaveValue('RSS');
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
    it('should call onSearchChange when type changes', async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();
      render(<SourceSearch searchState={defaultSearchState} onSearchChange={onSearchChange} />);

      await user.selectOptions(screen.getByLabelText('Type'), 'RSS');

      expect(onSearchChange).toHaveBeenCalledWith({
        ...defaultSearchState,
        sourceType: 'RSS',
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
      const searchState = { keyword: 'test', sourceType: 'RSS', active: true };
      render(<SourceSearch searchState={searchState} onSearchChange={onSearchChange} />);

      await user.click(screen.getByRole('button', { name: 'Clear All Filters' }));

      expect(onSearchChange).toHaveBeenCalledWith({
        keyword: '',
        sourceType: null,
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

    it('should show Clear All when sourceType is set', () => {
      const searchState = { ...defaultSearchState, sourceType: 'RSS' };
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
      sourceType: 'RSS',
      active: true,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: 'Blog',
      source_type: 'RSS',
      active: true,
    });
  });

  it('should omit empty values', () => {
    const state: SourceSearchState = {
      keyword: '',
      sourceType: null,
      active: null,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: undefined,
      source_type: undefined,
      active: undefined,
    });
  });

  it('should handle partial state', () => {
    const state: SourceSearchState = {
      keyword: 'test',
      sourceType: null,
      active: true,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: 'test',
      source_type: undefined,
      active: true,
    });
  });

  it('should handle active: false correctly', () => {
    const state: SourceSearchState = {
      keyword: '',
      sourceType: null,
      active: false,
    };

    expect(toSearchParams(state)).toEqual({
      keyword: undefined,
      source_type: undefined,
      active: false,
    });
  });
});

describe('hasActiveFilters', () => {
  it('should return false for empty state', () => {
    const state: SourceSearchState = {
      keyword: '',
      sourceType: null,
      active: null,
    };

    expect(hasActiveFilters(state)).toBe(false);
  });

  it('should return true when keyword is set', () => {
    const state: SourceSearchState = {
      keyword: 'test',
      sourceType: null,
      active: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when sourceType is set', () => {
    const state: SourceSearchState = {
      keyword: '',
      sourceType: 'RSS',
      active: null,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when active is true', () => {
    const state: SourceSearchState = {
      keyword: '',
      sourceType: null,
      active: true,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when active is false', () => {
    const state: SourceSearchState = {
      keyword: '',
      sourceType: null,
      active: false,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });

  it('should return true when multiple filters are set', () => {
    const state: SourceSearchState = {
      keyword: 'test',
      sourceType: 'RSS',
      active: true,
    };

    expect(hasActiveFilters(state)).toBe(true);
  });
});
