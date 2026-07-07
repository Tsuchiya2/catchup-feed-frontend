import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewCard } from './ReviewCard';
import { LEARNING_TEST_IDS } from '@/constants/learning';
import type { PendingReview } from '@/types/api';

const review: PendingReview = {
  log_id: 12,
  item_id: 3,
  asked_on: '2026-07-07',
  concept: 'goroutine リーク検出',
  question: 'goroutine リークはどう検出する?',
  answer: 'pprof の goroutine プロファイルで数の増加を見る。',
};

describe('ReviewCard', () => {
  it('shows the concept and question but hides the answer initially', () => {
    render(<ReviewCard review={review} onGrade={vi.fn()} />);

    expect(screen.getByText(review.concept)).toBeInTheDocument();
    expect(screen.getByText(review.question)).toBeInTheDocument();
    expect(screen.queryByTestId(LEARNING_TEST_IDS.ANSWER)).not.toBeInTheDocument();
  });

  it('does not show grade buttons before the answer is revealed', () => {
    render(<ReviewCard review={review} onGrade={vi.fn()} />);

    expect(
      screen.queryByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-good`)
    ).not.toBeInTheDocument();
  });

  it('reveals the answer and grade buttons on tap', async () => {
    const user = userEvent.setup();
    render(<ReviewCard review={review} onGrade={vi.fn()} />);

    await user.click(screen.getByTestId(LEARNING_TEST_IDS.REVEAL_BUTTON));

    expect(screen.getByTestId(LEARNING_TEST_IDS.ANSWER)).toHaveTextContent(review.answer);
    expect(screen.getByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-good`)).toBeInTheDocument();
    expect(screen.getByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-fuzzy`)).toBeInTheDocument();
    expect(screen.getByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-forgot`)).toBeInTheDocument();
  });

  it('calls onGrade with the chosen result', async () => {
    const user = userEvent.setup();
    const onGrade = vi.fn();
    render(<ReviewCard review={review} onGrade={onGrade} />);

    await user.click(screen.getByTestId(LEARNING_TEST_IDS.REVEAL_BUTTON));
    await user.click(screen.getByTestId(`${LEARNING_TEST_IDS.GRADE_BUTTON}-forgot`));

    expect(onGrade).toHaveBeenCalledWith('forgot');
  });
});
