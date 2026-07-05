import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSubscribers,
  getSubscriber,
  createSubscriber,
  updateSubscriber,
  deactivateSubscriber,
  getSubscriberTokens,
  issueToken,
  revokeToken,
} from '../subscribers';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { Subscriber, FeedToken, IssuedFeedToken, RevokedFeedToken } from '@/types/api';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSubscriber: Subscriber = {
  id: 1,
  name: 'Taro',
  email: 'taro@example.com',
  note: 'College friend',
  active: true,
  created_at: '2026-06-01T09:00:00Z',
  deactivated_at: null,
};

describe('Subscribers API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSubscribers', () => {
    it('calls GET /subscribers', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockSubscriber]);

      const result = await getSubscribers();

      expect(apiClient.get).toHaveBeenCalledWith('/subscribers');
      expect(result).toEqual([mockSubscriber]);
    });

    it('propagates API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError('Server Error', 500));

      await expect(getSubscribers()).rejects.toThrow('Server Error');
    });
  });

  describe('getSubscriber', () => {
    it('calls GET /subscribers/:id', async () => {
      vi.mocked(apiClient.get).mockResolvedValue(mockSubscriber);

      const result = await getSubscriber(1);

      expect(apiClient.get).toHaveBeenCalledWith('/subscribers/1');
      expect(result).toEqual(mockSubscriber);
    });
  });

  describe('createSubscriber', () => {
    it('calls POST /subscribers with the input body', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockSubscriber);

      const input = { name: 'Taro', email: 'taro@example.com', note: null };
      const result = await createSubscriber(input);

      expect(apiClient.post).toHaveBeenCalledWith('/subscribers', input);
      expect(result).toEqual(mockSubscriber);
    });
  });

  describe('updateSubscriber', () => {
    it('calls PUT /subscribers/:id with the FULL state (replacement semantics)', async () => {
      vi.mocked(apiClient.put).mockResolvedValue(mockSubscriber);

      const input = { name: 'Taro', email: null, note: null };
      const result = await updateSubscriber(1, input);

      expect(apiClient.put).toHaveBeenCalledWith('/subscribers/1', input);
      expect(result).toEqual(mockSubscriber);
    });
  });

  describe('deactivateSubscriber', () => {
    it('calls DELETE /subscribers/:id (soft delete)', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deactivateSubscriber(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/subscribers/1');
    });
  });

  describe('getSubscriberTokens', () => {
    it('calls GET /subscribers/:id/tokens', async () => {
      const tokens: FeedToken[] = [
        {
          id: 10,
          subscriber_id: 1,
          active: true,
          created_at: '2026-07-01T00:00:00Z',
          revoked_at: null,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(tokens);

      const result = await getSubscriberTokens(1);

      expect(apiClient.get).toHaveBeenCalledWith('/subscribers/1/tokens');
      expect(result).toEqual(tokens);
      // Plaintext token must never be part of the list response (D-5)
      expect(result[0]).not.toHaveProperty('token');
      expect(result[0]).not.toHaveProperty('feed_url');
    });
  });

  describe('issueToken', () => {
    it('calls POST /subscribers/:id/tokens and returns the one-time plaintext', async () => {
      const issued: IssuedFeedToken = {
        id: 11,
        subscriber_id: 1,
        token: 'plaintext-token',
        feed_url: 'https://radio.catchup-feed.com/feeds/plaintext-token/feed.xml',
        active: true,
        created_at: '2026-07-04T00:00:00Z',
        revoked_at: null,
      };
      vi.mocked(apiClient.post).mockResolvedValue(issued);

      const result = await issueToken(1);

      expect(apiClient.post).toHaveBeenCalledWith('/subscribers/1/tokens');
      expect(result.feed_url).toContain('/feed.xml');
      expect(result.token).toBe('plaintext-token');
    });

    it('propagates 409 when the subscriber is deactivated', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError('conflict', 409));

      await expect(issueToken(1)).rejects.toThrow('conflict');
    });
  });

  describe('revokeToken', () => {
    it('calls DELETE /tokens/:id', async () => {
      const revoked: RevokedFeedToken = {
        id: 10,
        subscriber_id: 1,
        active: false,
        created_at: '2026-07-01T00:00:00Z',
        revoked_at: '2026-07-04T00:00:00Z',
        note: 'Revocation is irreversible',
      };
      vi.mocked(apiClient.delete).mockResolvedValue(revoked);

      const result = await revokeToken(10);

      expect(apiClient.delete).toHaveBeenCalledWith('/tokens/10');
      expect(result.active).toBe(false);
    });
  });
});
