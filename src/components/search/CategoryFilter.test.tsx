import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from './CategoryFilter';

describe('CategoryFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render with label', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render empty input when value is null', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('should render with current value', () => {
      render(<CategoryFilter value="dev" onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('dev');
    });

    it('should render with placeholder', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByPlaceholderText('e.g., dev')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CategoryFilter value={null} onChange={vi.fn()} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Debounced Changes', () => {
    it('should call onChange with typed value after debounce delay (300ms)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<CategoryFilter value={null} onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), 'dev');

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('dev');
        expect(onChange).toHaveBeenCalledTimes(1);
      });
    });

    it('should trim the value before calling onChange', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<CategoryFilter value={null} onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), '  dev  ');

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('dev');
      });
    });

    it('should call onChange with null when input is cleared', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<CategoryFilter value="dev" onChange={onChange} />);

      await user.clear(screen.getByRole('textbox'));

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(null);
      });
    });

    it('should not call onChange for whitespace-only input when no filter is set', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<CategoryFilter value={null} onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), '   ');

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Whitespace normalizes to null, which equals the current value
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not call onChange when debounced value equals current value', async () => {
      const onChange = vi.fn();
      render(<CategoryFilter value="dev" onChange={onChange} />);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should cancel previous timeout on rapid typing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<CategoryFilter value={null} onChange={onChange} />);

      const input = screen.getByRole('textbox');

      await user.type(input, 'd');
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await user.type(input, 'e');
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await user.type(input, 'v');
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Still not called (debounce restarted on each keystroke)
      expect(onChange).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('dev');
        expect(onChange).toHaveBeenCalledTimes(1);
      });
    });

    it('should respect custom debounce delay', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<CategoryFilter value={null} onChange={onChange} debounceMs={500} />);

      await user.type(screen.getByRole('textbox'), 'ai');

      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(onChange).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('ai');
      });
    });
  });

  describe('External Value Sync', () => {
    it('should sync input when value changes externally', () => {
      const { rerender } = render(<CategoryFilter value="dev" onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('dev');

      rerender(<CategoryFilter value="ai" onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('ai');
    });

    it('should clear input when value is reset externally (e.g. Clear All Filters)', () => {
      const { rerender } = render(<CategoryFilter value="dev" onChange={vi.fn()} />);

      rerender(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} disabled={true} />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not disable input by default', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('textbox', { name: 'Filter by category' })).toBeInTheDocument();
    });

    it('should have associated label', () => {
      render(<CategoryFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'category-filter');
    });
  });
});
