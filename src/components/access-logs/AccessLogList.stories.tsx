import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AccessLogList } from './AccessLogList';
import type { AccessLog } from '@/types/api';

/**
 * AccessLogList Component
 *
 * Chronological timeline of feed accesses: feed.xml fetches and episode
 * mp3 downloads, with subscriber name and user agent.
 */
const meta = {
  title: 'AccessLogs/AccessLogList',
  component: AccessLogList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccessLogList>;

export default meta;
type Story = StoryObj<typeof meta>;

const logs: AccessLog[] = [
  {
    id: 101,
    token_id: 11,
    subscriber_id: 1,
    subscriber_name: 'Taro',
    episode_id: 42,
    user_agent: 'Podcasts/1610.2 CFNetwork/1490.0.4 Darwin/23.2.0',
    accessed_at: '2026-07-04T06:31:00Z',
  },
  {
    id: 100,
    token_id: 11,
    subscriber_id: 1,
    subscriber_name: 'Taro',
    episode_id: null,
    user_agent: 'Podcasts/1610.2 CFNetwork/1490.0.4 Darwin/23.2.0',
    accessed_at: '2026-07-04T06:30:00Z',
  },
  {
    id: 99,
    token_id: 12,
    subscriber_id: 2,
    subscriber_name: 'Hanako',
    episode_id: null,
    user_agent: null,
    accessed_at: '2026-07-03T22:10:00Z',
  },
];

/**
 * Mixed feed fetches and episode downloads
 */
export const Default: Story = {
  args: {
    logs,
  },
};

/**
 * On a friend detail page (subscriber name hidden)
 */
export const WithoutSubscriberName: Story = {
  args: {
    logs,
    hideSubscriber: true,
  },
};

/**
 * No accesses recorded
 */
export const Empty: Story = {
  args: {
    logs: [],
  },
};
