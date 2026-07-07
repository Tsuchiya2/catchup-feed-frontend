import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GradingDeck } from './GradingDeck';
import type { PendingReview } from '@/types/api';

/**
 * GradingDeck Component
 *
 * The one-card-at-a-time grading flow. Grading advances instantly
 * (optimistic); an empty deck is a good day, shown warmly.
 */
const meta = {
  title: 'Learning/GradingDeck',
  component: GradingDeck,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GradingDeck>;

export default meta;
type Story = StoryObj<typeof meta>;

const reviews: PendingReview[] = [
  {
    log_id: 1,
    item_id: 10,
    asked_on: '2026-07-07',
    concept: 'goroutine リーク検出',
    question: 'goroutine リークはまず何を見て切り分けますか?',
    answer: 'pprof の goroutine プロファイルを2回取り、数の単調増加を見る。',
  },
  {
    log_id: 2,
    item_id: 11,
    asked_on: '2026-07-07',
    concept: 'context のキャンセル伝播',
    question: 'context.WithCancel の cancel を呼び忘れると何が起きますか?',
    answer: 'context がリークし、紐づく goroutine が終了せず残ることがある。',
  },
];

/**
 * A deck with reviews to grade.
 */
export const WithReviews: Story = {
  args: {
    reviews,
    onGrade: () => {},
  },
};

/**
 * Nothing to grade — the calm empty state.
 */
export const Empty: Story = {
  args: {
    reviews: [],
    onGrade: () => {},
  },
};
