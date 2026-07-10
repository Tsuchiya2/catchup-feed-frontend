import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LearningItemCard } from './LearningItemCard';
import type { LearningItem } from '@/types/api';

/**
 * LearningItemCard Component
 *
 * One row in the理解トラッカー: concept, kind badge, stage, next scheduled
 * date, and a compact history. The due date is shown plainly — no overdue
 * warning color, no "N days late" framing.
 */
const meta = {
  title: 'Learning/LearningItemCard',
  component: LearningItemCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LearningItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const active: LearningItem = {
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

/**
 * Active article item with history.
 */
export const Active: Story = {
  args: {
    item: active,
    onRetire: () => {},
  },
};

/**
 * Book-derived item, forgotten last time (pulled back to stage 0).
 */
export const BookForgot: Story = {
  args: {
    item: {
      ...active,
      id: 4,
      kind: 'book',
      article_id: null,
      book_id: 7,
      concept: '名前は意図を語る',
      provider: 'ollama',
      stage: 0,
      due_on: '2026-07-08',
      last_result: 'forgot',
    },
    onRetire: () => {},
  },
};

/**
 * Graduated (retired) item — read-only, no next date, no retire button.
 */
export const Graduated: Story = {
  args: {
    item: {
      ...active,
      id: 5,
      stage: 3,
      retired_at: '2026-08-01T00:00:00Z',
      times_asked: 4,
    },
  },
};
