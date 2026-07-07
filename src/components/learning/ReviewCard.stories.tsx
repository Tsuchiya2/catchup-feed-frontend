import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReviewCard } from './ReviewCard';
import type { PendingReview } from '@/types/api';

/**
 * ReviewCard Component
 *
 * A single review on the grading page (mobile-first): concept + question,
 * tap to reveal the answer, then ○ △ × to grade. No counters, no overdue
 * warnings — grading is a quiet, frictionless flow.
 */
const meta = {
  title: 'Learning/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const review: PendingReview = {
  log_id: 12,
  item_id: 3,
  asked_on: '2026-07-07',
  concept: 'goroutine リーク検出',
  question:
    'goroutine リークが疑われるとき、まず何を見て切り分けますか?ラジオで触れた方法を思い出してみましょう。',
  answer:
    'pprof の goroutine プロファイルを取り、時間をおいて2回比較して数が単調増加していないかを見ます。増えていれば、どのスタックで滞留しているかがそのまま原因箇所です。',
};

/**
 * Question shown, answer hidden until tapped.
 */
export const Question: Story = {
  args: {
    review,
    onGrade: () => {},
  },
};

/**
 * A short book-derived review.
 */
export const BookReview: Story = {
  args: {
    review: {
      ...review,
      log_id: 20,
      concept: '名前は意図を語る',
      question: '良い変数名の条件を、本で挙げられていた観点から一つ挙げてください。',
      answer: '「誤解されない」こと。読み手が別の意味に取れる名前は、短くても悪い名前です。',
    },
    onGrade: () => {},
  },
};
