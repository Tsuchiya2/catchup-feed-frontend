import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessLogs, getAccessLogSummary } from '../accessLogs';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { AccessLog, AccessLogSummary } from '@/types/api';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockLog: AccessLog = {
  id: 100,
  token_id: 10,
  subscriber_id: 1,
  subscriber_name: 'Taro',
  episode_id: null,
  user_agent: 'Podcasts/1610.2',
  accessed_at: '2026-07-04T06:30:00Z',
};

describe('Access Logs API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccessLogs', () => {
    it('calls GET /access-logs without params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockLog]);

      const result = await getAccessLogs();

      expect(apiClient.get).toHaveBeenCalledWith('/access-logs');
      expect(result).toEqual([mockLog]);
    });

    it('builds the subscriber_id and limit query params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      await getAccessLogs({ subscriber_id: 3, limit: 50 });

      expect(apiClient.get).toHaveBeenCalledWith('/access-logs?subscriber_id=3&limit=50');
    });

    it('omits undefined params', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      await getAccessLogs({ limit: 200 });

      expect(apiClient.get).toHaveBeenCalledWith('/access-logs?limit=200');
    });

    it('propagates API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError('Server Error', 500));

      await expect(getAccessLogs()).rejects.toThrow('Server Error');
    });
  });

  describe('getAccessLogSummary', () => {
    it('calls GET /access-logs/summary', async () => {
      const summary: AccessLogSummary[] = [
        {
          subscriber_id: 1,
          subscriber_name: 'Taro',
          active: true,
          last_accessed_at: '2026-07-04T06:30:00Z',
          days_since_last_access: 0,
          count_7d: 5,
          count_30d: 20,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(summary);

      const result = await getAccessLogSummary();

      expect(apiClient.get).toHaveBeenCalledWith('/access-logs/summary');
      expect(result).toEqual(summary);
    });
  });
});
