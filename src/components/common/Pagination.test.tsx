import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when totalPages is 1', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 0', () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render navigation element with aria-label', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination navigation');
    });

    it('should apply custom className', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          className="custom-class"
        />
      );
      expect(screen.getByRole('navigation')).toHaveClass('custom-class');
    });
  });

  describe('Previous Button', () => {
    it('should disable previous button on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByLabelText('前のページへ');
      expect(prevButton).toBeDisabled();
    });

    it('should enable previous button when not on first page', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByLabelText('前のページへ');
      expect(prevButton).not.toBeDisabled();
    });

    it('should call onPageChange with previous page when clicked', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const prevButton = screen.getByLabelText('前のページへ');
      fireEvent.click(prevButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Next Button', () => {
    it('should disable next button on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByLabelText('次のページへ');
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when not on last page', () => {
      render(<Pagination currentPage={4} totalPages={5} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByLabelText('次のページへ');
      expect(nextButton).not.toBeDisabled();
    });

    it('should call onPageChange with next page when clicked', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const nextButton = screen.getByLabelText('次のページへ');
      fireEvent.click(nextButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe('Page Numbers (7 or fewer pages)', () => {
    it('should show all pages when totalPages is 3', () => {
      render(<Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />);
      expect(screen.getByLabelText('1 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('2 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('3 ページへ')).toBeInTheDocument();
    });

    it('should show all pages when totalPages is 7', () => {
      render(<Pagination currentPage={4} totalPages={7} onPageChange={mockOnPageChange} />);
      for (let i = 1; i <= 7; i++) {
        expect(screen.getByLabelText(`${i} ページへ`)).toBeInTheDocument();
      }
    });

    it('should highlight current page', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const currentButton = screen.getByLabelText('3 ページへ');
      expect(currentButton).toHaveAttribute('aria-current', 'page');
    });

    it('should call onPageChange when page button is clicked', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      const pageButton = screen.getByLabelText('3 ページへ');
      fireEvent.click(pageButton);
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Page Numbers with Ellipsis (more than 7 pages)', () => {
    it('should show ellipsis when totalPages is 10 and current page is near beginning', () => {
      render(<Pagination currentPage={2} totalPages={10} onPageChange={mockOnPageChange} />);

      // Should show: 1, 2, 3, 4, ..., 10
      expect(screen.getByLabelText('1 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('2 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('3 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('4 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('10 ページへ')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should show ellipsis when current page is near end', () => {
      render(<Pagination currentPage={9} totalPages={10} onPageChange={mockOnPageChange} />);

      // Should show: 1, ..., 7, 8, 9, 10
      expect(screen.getByLabelText('1 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('7 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('8 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('9 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('10 ページへ')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should show ellipsis on both sides when in middle', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);

      // Should show: 1, ..., 4, 5, 6, ..., 10
      expect(screen.getByLabelText('1 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('4 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('5 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('6 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('10 ページへ')).toBeInTheDocument();

      // Should have two ellipsis elements
      const ellipsisElements = screen.getAllByText('...');
      expect(ellipsisElements).toHaveLength(2);
    });

    it('should hide ellipsis from screen readers', () => {
      render(<Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />);
      const ellipsisElements = screen.getAllByText('...');
      ellipsisElements.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Items Shown Text', () => {
    it('should show items text when totalItems and itemsPerPage provided', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          totalItems={50}
          itemsPerPage={10}
        />
      );
      expect(screen.getByText('1–10 ／ 50 件')).toBeInTheDocument();
    });

    it('should calculate correct range for middle pages', () => {
      render(
        <Pagination
          currentPage={3}
          totalPages={5}
          onPageChange={mockOnPageChange}
          totalItems={50}
          itemsPerPage={10}
        />
      );
      expect(screen.getByText('21–30 ／ 50 件')).toBeInTheDocument();
    });

    it('should show correct end value for last partial page', () => {
      render(
        <Pagination
          currentPage={5}
          totalPages={5}
          onPageChange={mockOnPageChange}
          totalItems={47}
          itemsPerPage={10}
        />
      );
      expect(screen.getByText('41–47 ／ 47 件')).toBeInTheDocument();
    });

    it('should not show items text when totalItems is not provided', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          itemsPerPage={10}
        />
      );
      expect(screen.queryByText(/件/)).not.toBeInTheDocument();
    });

    it('should not show items text when itemsPerPage is not provided', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          totalItems={50}
        />
      );
      expect(screen.queryByText(/件/)).not.toBeInTheDocument();
    });

    it('should have aria-live for screen readers', () => {
      render(
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={mockOnPageChange}
          totalItems={50}
          itemsPerPage={10}
        />
      );
      const itemsText = screen.getByText('1–10 ／ 50 件');
      expect(itemsText).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile View', () => {
    it('should show page indicator text on mobile', () => {
      render(<Pagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle page 1 of 2', () => {
      render(<Pagination currentPage={1} totalPages={2} onPageChange={mockOnPageChange} />);
      expect(screen.getByLabelText('前のページへ')).toBeDisabled();
      expect(screen.getByLabelText('次のページへ')).not.toBeDisabled();
    });

    it('should handle page 2 of 2', () => {
      render(<Pagination currentPage={2} totalPages={2} onPageChange={mockOnPageChange} />);
      expect(screen.getByLabelText('前のページへ')).not.toBeDisabled();
      expect(screen.getByLabelText('次のページへ')).toBeDisabled();
    });

    it('should handle very large page numbers', () => {
      render(<Pagination currentPage={500} totalPages={1000} onPageChange={mockOnPageChange} />);
      expect(screen.getByText('500 / 1000')).toBeInTheDocument();
      expect(screen.getByLabelText('499 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('500 ページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('501 ページへ')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role for navigation', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aria-labels for all interactive elements', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      expect(screen.getByLabelText('前のページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('次のページへ')).toBeInTheDocument();
      expect(screen.getByLabelText('1 ページへ')).toBeInTheDocument();
    });

    it('should mark current page with aria-current', () => {
      render(<Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);
      const buttons = screen.getAllByRole('button');
      const currentPageButton = buttons.find((btn) => btn.getAttribute('aria-current') === 'page');
      expect(currentPageButton).toBeInTheDocument();
      expect(currentPageButton).toHaveTextContent('3');
    });
  });
});
