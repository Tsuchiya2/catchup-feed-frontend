import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LearningItemCard } from './LearningItemCard';
import { LEARNING_TEST_IDS } from '@/constants/learning';
import type { LearningItem } from '@/types/api';

const activeItem: LearningItem = {
  id: 3,
  kind: 'article',
  article_id: 42,
  book_id: null,
  concept: 'goroutine リーク検出',
  question: 'q',
  answer: 'a',
  provider: 'gemini',
  stage: 1,
  due_on: '2026-07-14',
  retired_at: null,
  created_at: '2026-07-07T00:00:00Z',
  times_asked: 2,
  last_result: 'good',
  last_asked_on: '2026-07-07',
};

describe('LearningItemCard', () => {
  it('renders concept, stage, next date and history for an active item', () => {
    render(<LearningItemCard item={activeItem} onRetire={vi.fn()} />);

    expect(screen.getByText('goroutine リーク検出')).toBeInTheDocument();
    expect(screen.getByText('Stage 1')).toBeInTheDocument();
    expect(screen.getByText('2026-07-14')).toBeInTheDocument();
    expect(screen.getByText('2×')).toBeInTheDocument();
    expect(screen.getByText('○ わかった')).toBeInTheDocument();
    expect(screen.getByText('Article')).toBeInTheDocument();
  });

  it('calls onRetire when the retire button is tapped', async () => {
    const user = userEvent.setup();
    const onRetire = vi.fn();
    render(<LearningItemCard item={activeItem} onRetire={onRetire} />);

    await user.click(screen.getByTestId(LEARNING_TEST_IDS.RETIRE_BUTTON));
    expect(onRetire).toHaveBeenCalledWith(activeItem);
  });

  it('hides the retire button and the next date for a retired item', () => {
    render(
      <LearningItemCard
        item={{ ...activeItem, retired_at: '2026-08-01T00:00:00Z' }}
        onRetire={vi.fn()}
      />
    );

    expect(screen.queryByTestId(LEARNING_TEST_IDS.RETIRE_BUTTON)).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows a book badge for book items', () => {
    render(
      <LearningItemCard
        item={{ ...activeItem, kind: 'book', article_id: null, book_id: 7 }}
        onRetire={vi.fn()}
      />
    );

    expect(screen.getByText('Book')).toBeInTheDocument();
  });
});
