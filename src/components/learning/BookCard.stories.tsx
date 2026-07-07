import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BookCard } from './BookCard';
import type { LearningBook } from '@/types/api';

/**
 * BookCard Component
 *
 * One ingested book in the book manager (D-20): title, review status,
 * progress, and a single activate / deactivate toggle. At most one book is
 * active at a time; activating another swaps it.
 */
const meta = {
  title: 'Learning/BookCard',
  component: BookCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const base: LearningBook = {
  id: 7,
  title: 'リーダブルコード',
  review_status: 'idle',
  review_cursor: 45,
  total_chunks: 180,
};

/**
 * The in-progress book (offers Pause).
 */
export const Active: Story = {
  args: {
    book: { ...base, review_status: 'active', review_cursor: 90 },
    onActivate: () => {},
    onDeactivate: () => {},
  },
};

/**
 * A paused / idle book (offers Activate).
 */
export const Idle: Story = {
  args: {
    book: base,
    onActivate: () => {},
    onDeactivate: () => {},
  },
};

/**
 * A finished book (offers Re-read, which restarts from the beginning).
 */
export const Finished: Story = {
  args: {
    book: { ...base, review_status: 'finished', review_cursor: 180 },
    onActivate: () => {},
    onDeactivate: () => {},
  },
};
