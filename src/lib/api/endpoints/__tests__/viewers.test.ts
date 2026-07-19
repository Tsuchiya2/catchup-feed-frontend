import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getViewers, createViewer, updateViewer, setViewerActive, deleteViewer } from '../viewers';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { Viewer } from '@/types/api';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockViewer: Viewer = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  active: true,
  created_at: '2026-07-01T09:00:00Z',
  updated_at: '2026-07-01T09:00:00Z',
  deactivated_at: null,
};

describe('Viewers API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getViewers', () => {
    it('calls GET /viewers', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockViewer]);

      const result = await getViewers();

      expect(apiClient.get).toHaveBeenCalledWith('/viewers');
      expect(result).toEqual([mockViewer]);
    });

    it('propagates API errors (403 for non-admin)', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError('Forbidden', 403));

      await expect(getViewers()).rejects.toThrow('Forbidden');
    });
  });

  describe('createViewer', () => {
    it('calls POST /viewers with name, email and password', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockViewer);

      const input = { name: 'Alice', email: 'alice@example.com', password: 'correct-horse' };
      const result = await createViewer(input);

      expect(apiClient.post).toHaveBeenCalledWith('/viewers', input);
      expect(result).toEqual(mockViewer);
    });

    it('propagates duplicate email errors (409)', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError('email already exists', 409));

      await expect(
        createViewer({ name: 'Alice', email: 'alice@example.com', password: 'correct-horse' })
      ).rejects.toThrow('email already exists');
    });
  });

  describe('updateViewer', () => {
    it('calls PUT /viewers/:id with the input body', async () => {
      vi.mocked(apiClient.put).mockResolvedValue(mockViewer);

      const input = { name: 'Alice', email: 'alice@example.com' };
      const result = await updateViewer(1, input);

      expect(apiClient.put).toHaveBeenCalledWith('/viewers/1', input);
      expect(result).toEqual(mockViewer);
    });

    it('passes the optional password through when provided', async () => {
      vi.mocked(apiClient.put).mockResolvedValue(mockViewer);

      const input = { name: 'Alice', email: 'alice@example.com', password: 'new-password-123' };
      await updateViewer(1, input);

      expect(apiClient.put).toHaveBeenCalledWith('/viewers/1', input);
    });
  });

  describe('setViewerActive', () => {
    it('calls PUT /viewers/:id/active with {active: false} to deactivate', async () => {
      const deactivated: Viewer = {
        ...mockViewer,
        active: false,
        deactivated_at: '2026-07-19T00:00:00Z',
      };
      vi.mocked(apiClient.put).mockResolvedValue(deactivated);

      const result = await setViewerActive(1, false);

      expect(apiClient.put).toHaveBeenCalledWith('/viewers/1/active', { active: false });
      expect(result).toEqual(deactivated);
    });

    it('calls PUT /viewers/:id/active with {active: true} to reactivate', async () => {
      vi.mocked(apiClient.put).mockResolvedValue(mockViewer);

      const result = await setViewerActive(1, true);

      expect(apiClient.put).toHaveBeenCalledWith('/viewers/1/active', { active: true });
      expect(result).toEqual(mockViewer);
    });
  });

  describe('deleteViewer', () => {
    it('calls DELETE /viewers/:id (physical delete)', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deleteViewer(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/viewers/1');
    });

    it('propagates API errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new ApiError('viewer not found', 404));

      await expect(deleteViewer(999)).rejects.toThrow('viewer not found');
    });
  });
});
