import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSources, updateSourceActive, deleteSource } from '../sources';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { SourcesResponse } from '@/types/api';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Sources API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSources', () => {
    it('should call GET /sources endpoint', async () => {
      // Arrange
      const mockResponse: SourcesResponse = [
        {
          id: 1,
          name: 'Test Source',
          feed_url: 'https://example.com/feed.xml',
          url: 'https://example.com/feed.xml',
          category: 'tech',
          lang: 'en',
          active: true,
          created_at: '2025-01-01T12:00:00Z',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await getSources();

      // Assert
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/sources');
      expect(result).toEqual(mockResponse);
    });

    it('should return empty sources array when no sources exist', async () => {
      // Arrange
      const mockResponse: SourcesResponse = [];

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await getSources();

      // Assert
      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      // Arrange
      const mockError = new ApiError('Server Error', 500);
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      // Act & Assert
      await expect(getSources()).rejects.toThrow(ApiError);
      await expect(getSources()).rejects.toThrow('Server Error');
    });
  });

  describe('updateSourceActive', () => {
    it('should call PUT /sources/:id with correct endpoint', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act
      await updateSourceActive(1, false);

      // Assert
      expect(apiClient.put).toHaveBeenCalledTimes(1);
      expect(apiClient.put).toHaveBeenCalledWith('/sources/1', { active: false });
    });

    it('should send correct request body for activating source', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act
      await updateSourceActive(2, true);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith('/sources/2', { active: true });
    });

    it('should send correct request body for deactivating source', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act
      await updateSourceActive(3, false);

      // Assert
      expect(apiClient.put).toHaveBeenCalledWith('/sources/3', { active: false });
    });

    it('should resolve void on success (204 No Content)', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act
      const result = await updateSourceActive(5, true);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw ApiError on 403 Forbidden (permission denied)', async () => {
      // Arrange
      const mockError = new ApiError('Forbidden', 403);
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateSourceActive(1, false)).rejects.toThrow(ApiError);
      await expect(updateSourceActive(1, false)).rejects.toThrow('Forbidden');

      const error = await updateSourceActive(1, false).catch((e) => e);
      expect(error.status).toBe(403);
    });

    it('should throw ApiError on 404 Not Found', async () => {
      // Arrange
      const mockError = new ApiError('Not Found', 404);
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateSourceActive(999, true)).rejects.toThrow(ApiError);
      await expect(updateSourceActive(999, true)).rejects.toThrow('Not Found');

      const error = await updateSourceActive(999, true).catch((e) => e);
      expect(error.status).toBe(404);
    });

    it('should throw ApiError on 400 Bad Request (validation error)', async () => {
      // Arrange
      const mockError = new ApiError('Bad Request', 400);
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateSourceActive(1, true)).rejects.toThrow(ApiError);

      const error = await updateSourceActive(1, true).catch((e) => e);
      expect(error.status).toBe(400);
    });

    it('should throw ApiError on 500 Server Error', async () => {
      // Arrange
      const mockError = new ApiError('Internal Server Error', 500);
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      await expect(updateSourceActive(1, false)).rejects.toThrow(ApiError);

      const error = await updateSourceActive(1, false).catch((e) => e);
      expect(error.status).toBe(500);
    });

    it('should route the request through apiClient (cookie auth)', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act
      await updateSourceActive(1, false);

      // Assert
      // The apiClient.put method should be called (auth is carried by the
      // HttpOnly cookie via credentials:'include', not a header).
      expect(apiClient.put).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple sequential updates', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act
      await updateSourceActive(1, false);
      await updateSourceActive(1, true);

      // Assert
      expect(apiClient.put).toHaveBeenCalledTimes(2);
      expect(apiClient.put).toHaveBeenNthCalledWith(1, '/sources/1', { active: false });
      expect(apiClient.put).toHaveBeenNthCalledWith(2, '/sources/1', { active: true });
    });

    it('should handle concurrent updates to different sources', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockImplementation((endpoint) => {
        if (endpoint === '/sources/1' || endpoint === '/sources/2') {
          return Promise.resolve(undefined);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      await Promise.all([updateSourceActive(1, false), updateSourceActive(2, true)]);

      // Assert
      expect(apiClient.put).toHaveBeenCalledTimes(2);
      expect(apiClient.put).toHaveBeenCalledWith('/sources/1', { active: false });
      expect(apiClient.put).toHaveBeenCalledWith('/sources/2', { active: true });
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors', async () => {
      // Arrange
      const networkError = new Error('Network request failed');
      vi.mocked(apiClient.put).mockRejectedValue(networkError);

      // Act & Assert
      await expect(updateSourceActive(1, true)).rejects.toThrow('Network request failed');
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      vi.mocked(apiClient.put).mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(updateSourceActive(1, false)).rejects.toThrow('Request timeout');
    });

    it('should preserve error details in ApiError', async () => {
      // Arrange
      const mockError = new ApiError('Validation failed', 400, {
        field: 'active',
        message: 'Invalid value',
      });
      vi.mocked(apiClient.put).mockRejectedValue(mockError);

      // Act & Assert
      try {
        await updateSourceActive(1, true);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(400);
        expect((error as ApiError).details).toEqual({
          field: 'active',
          message: 'Invalid value',
        });
      }
    });
  });

  describe('Type Safety', () => {
    it('should accept valid boolean values for active parameter', async () => {
      // Arrange
      vi.mocked(apiClient.put).mockResolvedValue(undefined);

      // Act & Assert - These should compile and work
      await updateSourceActive(1, true);
      await updateSourceActive(1, false);

      const activeValue = true;
      await updateSourceActive(1, activeValue);
    });
  });

  describe('deleteSource', () => {
    it('should call DELETE /sources/:id with correct ID', async () => {
      // Arrange
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      // Act
      await deleteSource(42);

      // Assert
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/sources/42');
    });

    it('should throw ApiError on 403 Forbidden (permission denied)', async () => {
      // Arrange
      const mockError = new ApiError('Forbidden', 403);
      vi.mocked(apiClient.delete).mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteSource(1)).rejects.toThrow(ApiError);
      await expect(deleteSource(1)).rejects.toThrow('Forbidden');

      const error = await deleteSource(1).catch((e) => e);
      expect(error.status).toBe(403);
    });

    it('should throw ApiError on 404 Not Found', async () => {
      // Arrange
      const mockError = new ApiError('Not Found', 404);
      vi.mocked(apiClient.delete).mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteSource(999)).rejects.toThrow(ApiError);
      await expect(deleteSource(999)).rejects.toThrow('Not Found');

      const error = await deleteSource(999).catch((e) => e);
      expect(error.status).toBe(404);
    });

    it('should throw ApiError on 500 Server Error', async () => {
      // Arrange
      const mockError = new ApiError('Internal Server Error', 500);
      vi.mocked(apiClient.delete).mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteSource(1)).rejects.toThrow(ApiError);

      const error = await deleteSource(1).catch((e) => e);
      expect(error.status).toBe(500);
    });

    it('should handle multiple sequential deletes', async () => {
      // Arrange
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      // Act
      await deleteSource(1);
      await deleteSource(2);

      // Assert
      expect(apiClient.delete).toHaveBeenCalledTimes(2);
      expect(apiClient.delete).toHaveBeenCalledWith('/sources/1');
      expect(apiClient.delete).toHaveBeenCalledWith('/sources/2');
    });

    it('should route the request through apiClient (cookie auth)', async () => {
      // Arrange
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      // Act
      await deleteSource(1);

      // Assert
      // The apiClient.delete method should be called (auth is carried by the
      // HttpOnly cookie via credentials:'include', not a header).
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
    });

    it('should propagate network errors', async () => {
      // Arrange
      const networkError = new Error('Network request failed');
      vi.mocked(apiClient.delete).mockRejectedValue(networkError);

      // Act & Assert
      await expect(deleteSource(1)).rejects.toThrow('Network request failed');
    });

    it('should return void (no response body)', async () => {
      // Arrange
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      // Act
      const result = await deleteSource(1);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
