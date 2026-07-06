import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IssuedTokenDialog } from './IssuedTokenDialog';
import type { IssuedFeedToken } from '@/types/api';

/**
 * IssuedTokenDialog Component
 *
 * ONE-TIME display of a freshly issued feed subscription URL (D-5:
 * tokens are stored hashed, so the URL can never be shown again).
 * The dialog warns the user explicitly before they close it.
 */
const meta = {
  title: 'Subscribers/IssuedTokenDialog',
  component: IssuedTokenDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IssuedTokenDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const issuedToken: IssuedFeedToken = {
  id: 10,
  subscriber_id: 1,
  token: 'q3XanY0T3ZkQ4x8x0G1v2b3n4m5l6k7j8h9g0f1d2s3a',
  feed_url:
    'https://radio.catchup-feed.com/feeds/q3XanY0T3ZkQ4x8x0G1v2b3n4m5l6k7j8h9g0f1d2s3a/feed.xml',
  active: true,
  created_at: '2026-07-04T09:00:00Z',
  revoked_at: null,
};

/**
 * One-time URL display right after issuing a token
 */
export const Default: Story = {
  args: {
    issued: issuedToken,
    subscriberName: 'Taro',
    onClose: () => {},
  },
};
