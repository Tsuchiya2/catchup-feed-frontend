import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookCard } from './BookCard';
import { LEARNING_TEST_IDS } from '@/constants/learning';
import type { LearningBook } from '@/types/api';

const base: LearningBook = {
  id: 7,
  title: 'リーダブルコード',
  review_status: 'idle',
  review_cursor: 45,
  total_chunks: 180,
};

describe('BookCard', () => {
  it('shows title and progress percent', () => {
    render(<BookCard book={base} onActivate={vi.fn()} onDeactivate={vi.fn()} />);

    expect(screen.getByText('リーダブルコード')).toBeInTheDocument();
    // 45 / 180 = 25%
    expect(screen.getByText(/45 \/ 180 \(25%\)/)).toBeInTheDocument();
  });

  it('offers Activate for an idle book and calls onActivate', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<BookCard book={base} onActivate={onActivate} onDeactivate={vi.fn()} />);

    const toggle = screen.getByTestId(LEARNING_TEST_IDS.BOOK_TOGGLE);
    expect(toggle).toHaveTextContent('Activate');
    await user.click(toggle);
    expect(onActivate).toHaveBeenCalledWith(base);
  });

  it('offers Pause for an active book and calls onDeactivate', async () => {
    const user = userEvent.setup();
    const onDeactivate = vi.fn();
    render(
      <BookCard
        book={{ ...base, review_status: 'active' }}
        onActivate={vi.fn()}
        onDeactivate={onDeactivate}
      />
    );

    const toggle = screen.getByTestId(LEARNING_TEST_IDS.BOOK_TOGGLE);
    expect(toggle).toHaveTextContent('Pause');
    await user.click(toggle);
    expect(onDeactivate).toHaveBeenCalled();
  });

  it('labels a finished book as Re-read', () => {
    render(
      <BookCard
        book={{ ...base, review_status: 'finished', review_cursor: 180 }}
        onActivate={vi.fn()}
        onDeactivate={vi.fn()}
      />
    );

    expect(screen.getByTestId(LEARNING_TEST_IDS.BOOK_TOGGLE)).toHaveTextContent('Re-read');
    expect(screen.getByText(/180 \/ 180 \(100%\)/)).toBeInTheDocument();
  });

  it('handles zero total chunks without dividing by zero', () => {
    render(
      <BookCard
        book={{ ...base, review_cursor: 0, total_chunks: 0 }}
        onActivate={vi.fn()}
        onDeactivate={vi.fn()}
      />
    );

    expect(screen.getByText(/0 \/ 0 \(0%\)/)).toBeInTheDocument();
  });
});
