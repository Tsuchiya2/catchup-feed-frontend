import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from './ArticleCard';
import { createMockArticle } from '@/__test__/factories/articleFactory';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ArticleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render article title', () => {
      const article = createMockArticle({ title: 'My Article Title' });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('My Article Title')).toBeInTheDocument();
    });

    it('should render article summary', () => {
      const article = createMockArticle({ summary: 'This is the summary' });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('This is the summary')).toBeInTheDocument();
    });

    it('should render source label when sourceName provided', () => {
      const article = createMockArticle();
      render(<ArticleCard article={article} sourceName="Tech Blog" />);
      expect(screen.getByText('Tech Blog')).toBeInTheDocument();
    });

    it('should not render source label when sourceName not provided', () => {
      const article = createMockArticle({ source_name: undefined as unknown as string });
      render(<ArticleCard article={article} />);
      expect(screen.queryByText('Tech Blog')).not.toBeInTheDocument();
    });

    it('should render published date as Japanese relative time', () => {
      const article = createMockArticle({
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('2時間前')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should link to article detail page', () => {
      const article = createMockArticle({ id: 42 });
      render(<ArticleCard article={article} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/articles/42');
    });

    it('should have aria-label with article title', () => {
      const article = createMockArticle({ title: 'Test Article' });
      render(<ArticleCard article={article} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', '記事: Test Article');
    });
  });

  describe('Summary Truncation', () => {
    it('should truncate long summaries', () => {
      const longSummary = 'A'.repeat(200);
      const article = createMockArticle({ summary: longSummary });
      render(<ArticleCard article={article} />);

      // The summary text should be truncated with ellipsis
      const summaryElement = screen.getByText(/^A+\.\.\.$/);
      expect(summaryElement.textContent?.length).toBeLessThan(200);
    });

    it('should not truncate short summaries', () => {
      const shortSummary = 'Short summary';
      const article = createMockArticle({ summary: shortSummary });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('Short summary')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const article = createMockArticle();
      render(<ArticleCard article={article} className="custom-class" />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('should render as a hairline console row with one-step hover', () => {
      const article = createMockArticle();
      render(<ArticleCard article={article} />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('border-b');
      expect(link).toHaveClass('hover:bg-console-hover');
    });

    it('should have focus-visible styling', () => {
      const article = createMockArticle();
      render(<ArticleCard article={article} />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('focus-visible:outline-console-cyan');
    });
  });

  describe('Accessibility', () => {
    it('should have time element with datetime attribute', () => {
      const publishedAt = '2025-01-15T10:00:00Z';
      const article = createMockArticle({ published_at: publishedAt });
      render(<ArticleCard article={article} />);
      const timeElement = screen.getByRole('time');
      expect(timeElement).toHaveAttribute('datetime', publishedAt);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing title gracefully', () => {
      const article = createMockArticle({ title: '' });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('(無題)')).toBeInTheDocument();
    });

    it('should handle whitespace-only title', () => {
      const article = createMockArticle({ title: '   ' });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('(無題)')).toBeInTheDocument();
    });

    it('should handle whitespace-only summary', () => {
      const article = createMockArticle({ summary: '   ', title: 'Title only' });
      render(<ArticleCard article={article} />);
      // Whitespace summary should not render a summary line
      expect(screen.getByText('Title only')).toBeInTheDocument();
      expect(screen.queryByText(/^\s+$/)).not.toBeInTheDocument();
    });

    it('should handle null published_at', () => {
      const article = createMockArticle();
      article.published_at = null as unknown as string;
      render(<ArticleCard article={article} />);
      // Should not crash; mono position degrades to an em dash
      expect(screen.queryByRole('time')).not.toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const article = createMockArticle({ title: '<script>alert("xss")</script>' });
      render(<ArticleCard article={article} />);
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    });

    it('should handle very long source name', () => {
      const article = createMockArticle();
      const longSourceName = 'A'.repeat(100);
      render(<ArticleCard article={article} sourceName={longSourceName} />);
      expect(screen.getByText(longSourceName)).toBeInTheDocument();
    });
  });
});
