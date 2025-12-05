import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  describe('Rendering', () => {
    it('should render title', () => {
      render(<PageHeader title="Test Title" />);
      expect(screen.getByRole('heading', { level: 1, name: 'Test Title' })).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<PageHeader title="Test Title" description="Test description" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<PageHeader title="Test Title" />);
      const container = screen.getByRole('heading', { level: 1 }).parentElement;
      expect(container?.querySelectorAll('p').length).toBe(0);
    });

    it('should render action when provided', () => {
      render(<PageHeader title="Test Title" action={<button>Action Button</button>} />);
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('should not render action container when action not provided', () => {
      const { container } = render(<PageHeader title="Test Title" />);
      // Only one direct child (the title/description container)
      const wrapper = container.firstChild;
      expect(wrapper?.childNodes.length).toBe(1);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<PageHeader title="Test Title" className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have default flex layout', () => {
      const { container } = render(<PageHeader title="Test Title" />);
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('should have responsive styling', () => {
      const { container } = render(<PageHeader title="Test Title" />);
      expect(container.firstChild).toHaveClass('sm:flex-row');
      expect(container.firstChild).toHaveClass('sm:items-start');
    });

    it('should apply text styles to title', () => {
      render(<PageHeader title="Test Title" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('font-bold');
    });

    it('should apply muted foreground to description', () => {
      render(<PageHeader title="Test Title" description="Test description" />);
      const description = screen.getByText('Test description');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('Content', () => {
    it('should render long titles correctly', () => {
      const longTitle = 'A'.repeat(100);
      render(<PageHeader title={longTitle} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(longTitle);
    });

    it('should render long descriptions correctly', () => {
      const longDescription = 'B'.repeat(500);
      render(<PageHeader title="Title" description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should render complex action components', () => {
      render(
        <PageHeader
          title="Test Title"
          action={
            <div>
              <button>Button 1</button>
              <button>Button 2</button>
            </div>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Button 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button 2' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have h1 heading for page title', () => {
      render(<PageHeader title="Page Title" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Page Title');
    });

    it('should have proper text contrast class', () => {
      render(<PageHeader title="Title" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-foreground');
    });
  });

  describe('Edge Cases', () => {
    it('should render empty string title', () => {
      render(<PageHeader title="" />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('');
    });

    it('should render title with special characters', () => {
      const specialTitle = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
      render(<PageHeader title={specialTitle} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(specialTitle);
    });

    it('should render null action as nothing', () => {
      const { container } = render(<PageHeader title="Title" action={null} />);
      expect(container.querySelector('.flex-shrink-0')).not.toBeInTheDocument();
    });
  });
});
