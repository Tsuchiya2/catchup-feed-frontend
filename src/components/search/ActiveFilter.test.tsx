import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveFilter } from './ActiveFilter';

describe('ActiveFilter', () => {
  describe('Rendering', () => {
    it('should render with label', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('状態')).toBeInTheDocument();
    });

    it('should render all status options', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('option', { name: 'すべて' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '有効のみ' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '無効のみ' })).toBeInTheDocument();
    });

    it('should show All when value is null', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('状態')).toHaveValue('');
    });

    it('should show Active Only when value is true', () => {
      render(<ActiveFilter value={true} onChange={vi.fn()} />);

      expect(screen.getByLabelText('状態')).toHaveValue('true');
    });

    it('should show Inactive Only when value is false', () => {
      render(<ActiveFilter value={false} onChange={vi.fn()} />);

      expect(screen.getByLabelText('状態')).toHaveValue('false');
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

      await user.selectOptions(screen.getByLabelText('状態'), 'true');

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange with false when Inactive Only is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={null} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('状態'), 'false');

      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should call onChange with null when All is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={true} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('状態'), '');

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('should call onChange when changing from active to inactive', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ActiveFilter value={true} onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText('状態'), 'false');

      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Disabled State', () => {
    it('should disable select when disabled prop is true', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} disabled={true} />);

      expect(screen.getByLabelText('状態')).toBeDisabled();
    });

    it('should not disable select by default', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByLabelText('状態')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      expect(screen.getByRole('combobox', { name: '状態で絞り込む' })).toBeInTheDocument();
    });

    it('should have associated label', () => {
      render(<ActiveFilter value={null} onChange={vi.fn()} />);

      const select = screen.getByLabelText('状態');
      expect(select).toHaveAttribute('id', 'active-filter');
    });
  });
});
