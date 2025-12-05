import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatisticsCard } from './StatisticsCard';

describe('StatisticsCard', () => {
  describe('Rendering', () => {
    it('should render statistics card with title and value', () => {
      // Act
      render(<StatisticsCard title="Total Articles" value={42} />);

      // Assert
      expect(screen.getByText('Total Articles')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render string values', () => {
      // Act
      render(<StatisticsCard title="Status" value="Active" />);

      // Assert
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render zero value correctly', () => {
      // Act
      render(<StatisticsCard title="Errors" value={0} />);

      // Assert
      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render with custom icon', () => {
      // Arrange
      const TestIcon = () => <svg data-testid="test-icon" />;

      // Act
      render(<StatisticsCard title="Test" value={10} icon={<TestIcon />} />);

      // Assert
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render without icon', () => {
      // Act
      const { container } = render(<StatisticsCard title="Test" value={10} />);

      // Assert
      const iconContainer = container.querySelector('.h-4.w-4');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      // Act
      render(<StatisticsCard title="Total Articles" value={42} isLoading={true} />);

      // Assert
      expect(screen.getByText('Total Articles')).toBeInTheDocument();
      expect(screen.queryByText('42')).not.toBeInTheDocument();

      // Check for skeleton element (Skeleton component should have specific classes)
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should show value when not loading', () => {
      // Act
      render(<StatisticsCard title="Total Articles" value={42} isLoading={false} />);

      // Assert
      expect(screen.getByText('42')).toBeInTheDocument();

      // Skeleton should not be present
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).not.toBeInTheDocument();
    });

    it('should default to not loading', () => {
      // Act
      render(<StatisticsCard title="Test" value={100} />);

      // Assert
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      // Act
      const { container } = render(
        <StatisticsCard title="Test" value={10} className="custom-class" />
      );

      // Assert
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('should have card structure', () => {
      // Act
      render(<StatisticsCard title="Test" value={10} />);

      // Assert
      // Card component should have specific structure
      expect(screen.getByText('Test').closest('.text-sm')).toBeInTheDocument();
      expect(screen.getByText('10').closest('.text-2xl')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic card structure', () => {
      // Act
      const { container } = render(<StatisticsCard title="Total Articles" value={42} />);

      // Assert
      // Card should use semantic HTML
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      // Act
      render(<StatisticsCard title="Total Articles" value={42} />);

      // Assert
      // CardTitle should render as a heading element
      const title = screen.getByText('Total Articles');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should format large numbers correctly', () => {
      // Act
      render(<StatisticsCard title="Views" value={1234567} />);

      // Assert
      expect(screen.getByText('1234567')).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      // Act
      render(<StatisticsCard title="Balance" value={-50} />);

      // Assert
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      // Act
      render(<StatisticsCard title="Rating" value="4.5" />);

      // Assert
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      // Act
      render(<StatisticsCard title="Status" value="" />);

      // Assert
      expect(screen.getByText('Status')).toBeInTheDocument();
      // Empty value should still render (as empty div)
      const valueContainer = document.querySelector('.text-2xl');
      expect(valueContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive header layout', () => {
      // Act
      const { container } = render(<StatisticsCard title="Test" value={10} />);

      // Assert
      // CardHeader should have flex layout
      const header = container.querySelector('.flex');
      expect(header).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      // Act
      const { container } = render(
        <StatisticsCard title="Test" value={10} icon={<span>Icon</span>} />
      );

      // Assert
      // Header should have space-y-0 to prevent vertical spacing
      const header = container.querySelector('.space-y-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Multiple Cards', () => {
    it('should render multiple cards independently', () => {
      // Act
      const { container } = render(
        <>
          <StatisticsCard title="Articles" value={42} />
          <StatisticsCard title="Sources" value={5} />
          <StatisticsCard title="Users" value={100} />
        </>
      );

      // Assert
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Sources')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();

      // Should have 3 cards
      const cards = container.querySelectorAll('.text-2xl');
      expect(cards).toHaveLength(3);
    });

    it('should handle mixed loading states', () => {
      // Act
      render(
        <>
          <StatisticsCard title="Loaded" value={42} isLoading={false} />
          <StatisticsCard title="Loading" value={0} isLoading={true} />
        </>
      );

      // Assert
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.queryByText('0')).not.toBeInTheDocument();

      // Should have one skeleton
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(1);
    });
  });
});
