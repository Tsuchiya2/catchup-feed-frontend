import type { Meta, StoryObj } from '@storybook/react';
import { SubscriberCard } from './SubscriberCard';
import type { Subscriber } from '@/types/api';

/**
 * SubscriberCard Component
 *
 * Displays a friend (subscriber) with active/deactivated status,
 * contact info, and management actions. Deactivation is a soft delete.
 */
const meta = {
  title: 'Subscribers/SubscriberCard',
  component: SubscriberCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SubscriberCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const activeSubscriber: Subscriber = {
  id: 1,
  name: 'Taro',
  email: 'taro@example.com',
  note: 'College friend. Prefers tech topics, commutes 40 minutes.',
  active: true,
  created_at: '2026-06-01T09:00:00Z',
  deactivated_at: null,
};

const deactivatedSubscriber: Subscriber = {
  ...activeSubscriber,
  id: 2,
  name: 'Hanako',
  active: false,
  deactivated_at: '2026-06-20T12:00:00Z',
};

/**
 * Active friend with email and note
 */
export const Active: Story = {
  args: {
    subscriber: activeSubscriber,
    onEdit: () => {},
    onDeactivate: () => {},
  },
};

/**
 * Deactivated friend (soft-deleted, greyed out, no deactivate button)
 */
export const Deactivated: Story = {
  args: {
    subscriber: deactivatedSubscriber,
    onEdit: () => {},
    onDeactivate: () => {},
  },
};

/**
 * Minimal friend (name only)
 */
export const NameOnly: Story = {
  args: {
    subscriber: {
      ...activeSubscriber,
      id: 3,
      name: 'Jiro',
      email: null,
      note: null,
    },
    onEdit: () => {},
    onDeactivate: () => {},
  },
};
