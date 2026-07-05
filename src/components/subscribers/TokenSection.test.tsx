import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TokenSection } from './TokenSection';
import * as subscribersApi from '@/lib/api/endpoints/subscribers';
import { SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import type { IssuedFeedToken, Subscriber } from '@/types/api';

vi.mock('@/lib/api/endpoints/subscribers');

const subscriber: Subscriber = {
  id: 1,
  name: 'Taro',
  email: null,
  note: null,
  active: true,
  created_at: '2026-07-01T00:00:00Z',
  deactivated_at: null,
};

const issued: IssuedFeedToken = {
  id: 11,
  subscriber_id: 1,
  token: 'plain-token',
  feed_url: 'https://radio.catchup-feed.com/feeds/plain-token/feed.xml',
  active: true,
  created_at: '2026-07-04T00:00:00Z',
  revoked_at: null,
};

describe('TokenSection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        // Let reset() garbage-collect finished mutations immediately so the
        // D-5 cache assertions below are deterministic.
        mutations: { gcTime: 0 },
      },
    });
    vi.mocked(subscribersApi.getSubscriberTokens).mockResolvedValue([]);
    vi.mocked(subscribersApi.issueToken).mockResolvedValue(issued);
  });

  const renderSection = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <TokenSection subscriber={subscriber} />
      </QueryClientProvider>
    );

  it('shows the one-time dialog after issuing a token', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(await screen.findByTestId(SUBSCRIBER_TEST_IDS.ISSUE_TOKEN_BUTTON));

    expect(await screen.findByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_DIALOG)).toBeInTheDocument();
    expect(screen.getByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_FEED_URL)).toHaveTextContent(
      issued.feed_url
    );
  });

  it('purges the plaintext token from the mutation cache when the dialog closes (D-5)', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(await screen.findByTestId(SUBSCRIBER_TEST_IDS.ISSUE_TOKEN_BUTTON));
    await screen.findByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_DIALOG);

    // Precondition: while the dialog is open, the mutation cache still holds
    // the one-time plaintext (this is exactly what must not outlive the dialog).
    const openState = queryClient
      .getMutationCache()
      .getAll()
      .map((m) => m.state.data as IssuedFeedToken | undefined);
    expect(openState.some((data) => data?.token === issued.token)).toBe(true);

    await user.click(screen.getByRole('button', { name: /I saved the URL/i }));

    await waitFor(() => {
      expect(
        screen.queryByTestId(SUBSCRIBER_TEST_IDS.ISSUED_TOKEN_DIALOG)
      ).not.toBeInTheDocument();
    });

    // Regression (B-1): closing the dialog must reset the issue mutation so
    // mutation.data returns to undefined — no plaintext token or feed URL may
    // remain readable from the mutation cache (e.g. via ReactQueryDevtools).
    await waitFor(() => {
      const mutations = queryClient.getMutationCache().getAll();
      expect(mutations.every((m) => m.state.data === undefined)).toBe(true);
    });
  });
});
