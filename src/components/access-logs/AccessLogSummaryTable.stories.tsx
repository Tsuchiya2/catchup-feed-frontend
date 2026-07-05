import type { Meta, StoryObj } from '@storybook/react';
import { AccessLogSummaryTable } from './AccessLogSummaryTable';
import type { AccessLogSummary } from '@/types/api';

/**
 * AccessLogSummaryTable Component
 *
 * Per-friend access summary with neglect detection: friends who never
 * accessed the feed or have been silent for 2-3+ weeks are sorted to the
 * top and flagged. Plain table + badges (right-sized, no chart library).
 */
const meta = {
  title: 'AccessLogs/AccessLogSummaryTable',
  component: AccessLogSummaryTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccessLogSummaryTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const summaries: AccessLogSummary[] = [
  {
    subscriber_id: 1,
    subscriber_name: 'Taro',
    active: true,
    last_accessed_at: '2026-07-04T06:30:00Z',
    days_since_last_access: 0,
    count_7d: 9,
    count_30d: 34,
  },
  {
    subscriber_id: 2,
    subscriber_name: 'Hanako',
    active: true,
    last_accessed_at: '2026-06-18T21:00:00Z',
    days_since_last_access: 16,
    count_7d: 0,
    count_30d: 5,
  },
  {
    subscriber_id: 3,
    subscriber_name: 'Jiro',
    active: true,
    last_accessed_at: '2026-06-08T07:15:00Z',
    days_since_last_access: 26,
    count_7d: 0,
    count_30d: 1,
  },
  {
    subscriber_id: 4,
    subscriber_name: 'Shiro',
    active: true,
    last_accessed_at: null,
    days_since_last_access: null,
    count_7d: 0,
    count_30d: 0,
  },
  {
    subscriber_id: 5,
    subscriber_name: 'Goro',
    active: false,
    last_accessed_at: '2026-05-01T10:00:00Z',
    days_since_last_access: 64,
    count_7d: 0,
    count_30d: 0,
  },
];

/**
 * Mixed statuses: never-accessed and 3-week-silent friends float to the top
 */
export const Default: Story = {
  args: {
    summaries,
    onSelectSubscriber: () => {},
  },
};

/**
 * Everyone healthy
 */
export const AllActive: Story = {
  args: {
    summaries: summaries.slice(0, 1),
  },
};

/**
 * No friends registered yet
 */
export const Empty: Story = {
  args: {
    summaries: [],
  },
};
