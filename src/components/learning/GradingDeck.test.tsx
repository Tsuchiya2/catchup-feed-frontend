import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradingDeck } from './GradingDeck';
import { LEARNING_TEST_IDS } from '@/constants/learning';
import type { PendingReview } from '@/types/api';

const reviews: PendingReview[] = [
  { log_id: 1, item_id: 10, asked_on: '2026-07-07', concept: 'First', question: 'q1', answer: 'a1' },
  {
    log_id: 2,
    item_id: 11,
    asked_on: '2026-07-07',
    concept: 'Second',
    question: 'q2',
    answer: 'a2',
  },
];

describe('GradingDeck', () => {
  it('renders the friendly empty state when there is nothing to grade', () => {
    render(<GradingDeck reviews={[]} onGrade={vi.fn()} />);

    expect(screen.getByTestId(LEARNING_TEST_IDS.EMPTY)).toBeInTheDocument();
    expect(screen.getByText('今日は採点するものがありません')).toBeInTheDocument();
  });

  it('shows the oldest card first', () => {
    render(<GradingDeck reviews={reviews} onGrade={vi.fn()} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
  });

  it('advances to the next card immediately after grading (optimistic)', async () => {
    const user = userEvent.setup();
    const onGrade = vi.fn();
    render(<GradingDeck reviews={reviews} onGrade={onGrade} />);

    // Reveal + grade the first card.
    await user.click(screen.getByTestId(LEARNING_TEST_IDS.REVEAL_BUTTON));
    await user.click(screen.getByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-good`));

    expect(onGrade).toHaveBeenCalledWith(1, 'good');
    // Next card is shown, and its answer starts hidden again.
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.queryByTestId(LEARNING_TEST_IDS.ANSWER)).not.toBeInTheDocument();
  });

  it('reaches the empty state after the last card is graded', async () => {
    const user = userEvent.setup();
    render(<GradingDeck reviews={reviews.slice(0, 1)} onGrade={vi.fn()} />);

    await user.click(screen.getByTestId(LEARNING_TEST_IDS.REVEAL_BUTTON));
    await user.click(screen.getByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-fuzzy`));

    expect(screen.getByTestId(LEARNING_TEST_IDS.EMPTY)).toBeInTheDocument();
  });
});
