import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IssuedTokenDialog } from './IssuedTokenDialog';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { IssuedFeedToken } from '@/types/api';

const issued: IssuedFeedToken = {
  id: 11,
  subscriber_id: 1,
  token: 'plain-token',
  feed_url: 'https://radio.catchup-feed.com/feeds/plain-token/feed.xml',
  active: true,
  created_at: '2026-07-04T00:00:00Z',
  revoked_at: null,
};

describe('IssuedTokenDialog', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when no token is issued', () => {
    render(<IssuedTokenDialog issued={null} subscriberName="Taro" onClose={() => {}} />);
    expect(screen.queryByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_DIALOG)).not.toBeInTheDocument();
  });

  it('shows the feed URL prominently', () => {
    render(<IssuedTokenDialog issued={issued} subscriberName="Taro" onClose={() => {}} />);

    expect(screen.getByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_FEED_URL)).toHaveTextContent(
      issued.feed_url
    );
  });

  it('warns that the URL is shown only once (D-5)', () => {
    render(<IssuedTokenDialog issued={issued} subscriberName="Taro" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/only once/i);
    expect(alert).toHaveTextContent(/cannot be displayed again/i);
    expect(alert).toHaveTextContent(/revoke the token and issue a new one/i);
  });

  it('copies the feed URL to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<IssuedTokenDialog issued={issued} subscriberName="Taro" onClose={() => {}} />);

    // fireEvent to avoid user-event's own clipboard stubbing
    fireEvent.click(screen.getByTestId(SUBSCRIBER_TEST_IDS.COPY_FEED_URL_BUTTON));

    expect(writeText).toHaveBeenCalledWith(issued.feed_url);
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('does not close on Escape (the one-time URL must not be lost by accident)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<IssuedTokenDialog issued={issued} subscriberName="Taro" onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_DIALOG)).toBeInTheDocument();
  });

  it('calls onClose when the explicit close button is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<IssuedTokenDialog issued={issued} subscriberName="Taro" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /I saved the URL/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
