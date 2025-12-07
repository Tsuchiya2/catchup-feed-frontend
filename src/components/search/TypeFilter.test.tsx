import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeFilter } from './TypeFilter';

describe('TypeFilter', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Type')).toBeInTheDocument();
    });

    it('should render All Types option', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('option', { name: 'All Types' })).toBeInTheDocument();
    });

    it('should render all source type options', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('option', { name: 'RSS' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Webflow' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'NextJS' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Remix' })).toBeInTheDocument();
    });

    it('should show selected value', () => {
      render(<TypeFilter value="RSS" onChange={vi.fn()} />);

      expect(screen.getByLabelText('Type')).toHaveValue('RSS');
    });

    it('should show All Types when value is null', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Type')).toHaveValue('');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TypeFilter value={null} onChange={vi.fn()} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Selection', () => {
    it('should call onChange when type is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TypeFilter value={null} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Type'), 'RSS');

      expect(onChange).toHaveBeenCalledWith('RSS');
    });

    it('should call onChange with null when All Types is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TypeFilter value="RSS" onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Type'), '');

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should call onChange when changing between types', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<TypeFilter value="RSS" onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('Type'), 'Webflow');

      expect(onChange).toHaveBeenCalledWith('Webflow');
    });
  });

  describe('Disabled State', () => {
    it('should disable select when disabled prop is true', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} disabled={true} />);

      expect(screen.getByLabelText('Type')).toBeDisabled();
    });

    it('should not disable select by default', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('Type')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox', { name: 'Filter by source type' })).toBeInTheDocument();
    });

    it('should have associated label', () => {
      render(<TypeFilter value={null} onChange={vi.fn()} />);

      const select = screen.getByLabelText('Type');
      expect(select).toHaveAttribute('id', 'type-filter');
    });
  });
});
