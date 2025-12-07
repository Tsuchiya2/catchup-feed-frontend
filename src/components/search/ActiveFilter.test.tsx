import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveFilter } from './ActiveFilter';

describe('ActiveFilter', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });

    it('should render all status options', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Active Only' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Inactive Only' })).toBeInTheDocument();
    });

    it('should show All when value is null', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toHaveValue('');
    });

    it('should show Active Only when value is true', () => {
      render(<ActiveFilter value={true} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toHaveValue('true');
    });

    it('should show Inactive Only when value is false', () => {
      render(<ActiveFilter value={false} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).toHaveValue('false');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ActiveFilter value={null} onChange={vi.fn()} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Selection', () => {
    it('should call onChange with true when Active Only is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={null} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Status'), 'true');

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange with false when Inactive Only is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={null} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Status'), 'false');

      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should call onChange with null when All is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={true} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Status'), '');

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should call onChange when changing from active to inactive', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={true} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Status'), 'false');

      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Disabled State', () => {
    it('should disable select when disabled prop is true', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} disabled={true} />);

      expect(screen.getByLabelText('Status')).toBeDisabled();
    });

    it('should not disable select by default', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Status')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox', { name: 'Filter by status' })).toBeInTheDocument();
    });

    it('should have associated label', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      const select = screen.getByLabelText('Status');
      expect(select).toHaveAttribute('id', 'active-filter');
    });
  });
});
