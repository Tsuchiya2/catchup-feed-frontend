import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiClient } from './client';
import { ApiError, NetworkError, TimeoutError } from './errors';
import * as CsrfTokenManager from '@/lib/security/CsrfTokenManager';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Create new API client instance for each test
    apiClient = new ApiClient();

    // Store original fetch
    originalFetch = global.fetch;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    // Suppress console errors in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('request', () => {
    it('should make GET request with credentials included (cookie auth)', async () => {
      // Arrange
      const mockResponse = { data: 'test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' }),
        text: async () => JSON.stringify(mockResponse),
      });

      // Act
      const result = await apiClient.request('/test-endpoint');

      // Assert - auth travels via the HttpOnly cookie, so credentials must be
      // included and NO Authorization header is attached (H-1).
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers).not.toHaveProperty('Authorization');
      expect(result).toEqual(mockResponse);
    });

    it('should never attach an Authorization header', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '2' }),
        text: async () => '{}',
      });

      // Act
      await apiClient.request('/endpoint');

      // Assert
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers).not.toHaveProperty('Authorization');
    });

    it('should include credentials even when requiresAuth is false', async () => {
      // Arrange
      const mockResponse = { data: 'public' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' }),
        text: async () => JSON.stringify(mockResponse),
      });

      // Act
      await apiClient.request('/public-endpoint', { requiresAuth: false });

      // Assert - credentials are always included (login also needs Set-Cookie
      // to be honored), and there is still no Authorization header.
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/public-endpoint',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });

    it('should make POST request with body', async () => {
      // Arrange
      const requestBody = { email: 'test@example.com', password: 'password' };
      const mockResponse = { token: 'new-token' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' }),
        text: async () => JSON.stringify(mockResponse),
      });

      // Act
      const result = await apiClient.request('/auth/token', {
        method: 'POST',
        body: requestBody,
      });

      // Assert
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should pass FormData through without JSON content-type (multipart upload)', async () => {
      // Arrange
      const formData = new FormData();
      formData.append('title', 'test book');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-length': '2' }),
        text: async () => '{}',
      });

      // Act
      await apiClient.request('/books', { method: 'POST', body: formData });

      // Assert - the body must be the FormData itself (not JSON.stringify'd)
      // and Content-Type must be left to the browser so it can set the
      // multipart boundary.
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].body).toBe(formData);
      expect(fetchCall[1].headers).not.toHaveProperty('Content-Type');
    });

    it('should handle 401 error by clearing CSRF token and redirecting', async () => {
      // Arrange
      const clearCsrfTokenSpy = vi.spyOn(CsrfTokenManager, 'clearCsrfToken');
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
        headers: new Headers(),
      });

      // Act & Assert
      await expect(apiClient.request('/protected')).rejects.toThrow(ApiError);

      // The HttpOnly JWT cookie can't be cleared from JS; we clear the CSRF
      // token and bounce to /login.
      expect(clearCsrfTokenSpy).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should handle 404 error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found', error: 'Resource not found' }),
        headers: new Headers(),
      });

      // Act & Assert
      await expect(apiClient.request('/missing')).rejects.toThrow(ApiError);
      const error = (await apiClient.request('/missing').catch((e) => e)) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
    });

    it('should handle 500 server error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
        headers: new Headers(),
      });

      // Act & Assert - disable retries to prevent timeout
      const error = (await apiClient
        .request('/error', { retry: false })
        .catch((e) => e)) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal server error');
    });

    it('should parse error response with details', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Validation error',
          details: { email: 'Invalid email format' },
        }),
        headers: new Headers(),
      });

      // Act & Assert
      const error = (await apiClient.request('/validate').catch((e) => e)) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.details).toEqual({ email: 'Invalid email format' });
    });

    it('should handle error response without JSON body', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => {
          throw new Error('Not JSON');
        },
        headers: new Headers(),
      });

      // Act & Assert - disable retries to prevent timeout
      const error = (await apiClient
        .request('/unavailable', { retry: false })
        .catch((e) => e)) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Request failed with status 503');
    });

    it('should handle network timeout', async () => {
      // Arrange
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      // Act & Assert - disable retries to prevent timeout
      await expect(apiClient.request('/slow', { timeout: 50, retry: false })).rejects.toThrow(
        TimeoutError
      );
      const error = (await apiClient
        .request('/slow', { timeout: 50, retry: false })
        .catch((e) => e)) as TimeoutError;

      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toContain('timed out');
    });

    it('should handle network error', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      // Act & Assert - disable retries to prevent timeout
      await expect(apiClient.request('/network-fail', { retry: false })).rejects.toThrow(
        NetworkError
      );
      const error = (await apiClient
        .request('/network-fail', { retry: false })
        .catch((e) => e)) as NetworkError;

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toContain('Failed to connect');
    });

    it('should use custom headers', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '2' }),
        text: async () => '{}',
      });

      // Act
      await apiClient.request('/custom', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should not include body in GET request', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '2' }),
        text: async () => '{}',
      });

      // Act
      await apiClient.request('/get-endpoint', {
        method: 'GET',
        body: { data: 'should-be-ignored' },
      });

      // Assert
      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].body).toBeUndefined();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '100' }),
        text: async () => JSON.stringify({ success: true }),
      });
    });

    it('should make GET request using get()', async () => {
      // Act
      await apiClient.get('/get-test');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/get-test',
        expect.objectContaining({ method: 'GET', credentials: 'include' })
      );
    });

    it('should make POST request using post()', async () => {
      // Arrange
      const body = { data: 'test' };

      // Act
      await apiClient.post('/post-test', body);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/post-test',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(body),
        })
      );
    });

    it('should make PUT request using put()', async () => {
      // Arrange
      const body = { data: 'update' };

      // Act
      await apiClient.put('/put-test', body);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/put-test',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
    });

    it('should make DELETE request using delete()', async () => {
      // Act
      await apiClient.delete('/delete-test');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/delete-test',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should re-throw ApiError instances', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
        headers: new Headers(),
      });

      // Act & Assert
      const error = (await apiClient.request('/bad').catch((e) => e)) as ApiError;
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Bad request');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const customError = new Error('Unknown error');
      global.fetch = vi.fn().mockRejectedValue(customError);

      // Act & Assert
      await expect(apiClient.request('/unknown', { retry: false })).rejects.toThrow(
        'Unknown error'
      );
    });
  });

  describe('retry logic', () => {
    it('should retry on network error up to maxRetries', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      // Act & Assert - use very short delays for testing
      const error = (await apiClient
        .request('/retry-test', {
          retry: { maxRetries: 2, initialDelay: 10, maxDelay: 50, backoffMultiplier: 1.5 },
        })
        .catch((e) => e)) as NetworkError;

      // Assert - should throw NetworkError after retries
      expect(error).toBeInstanceOf(NetworkError);
      // Verify fetch was called multiple times (retry logic working)
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should not retry on 4xx client errors', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
        headers: new Headers(),
      });

      // Act & Assert
      const error = (await apiClient
        .request('/client-error', { retry: { maxRetries: 3 } })
        .catch((e) => e)) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(400);
      // Should only be called once (no retries for 4xx)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should succeed on retry after initial failure', async () => {
      // Arrange - fail first, succeed second
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-length': '20' }),
          text: async () => JSON.stringify({ success: true }),
        });

      // Act - use very short delays for testing
      const result = await apiClient.request<{ success: boolean }>('/retry-success', {
        retry: { maxRetries: 3, initialDelay: 10, maxDelay: 50 },
      });

      // Assert
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should disable retries when retry is false', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      // Act & Assert
      await expect(apiClient.request('/no-retry', { retry: false })).rejects.toThrow(NetworkError);
      // Verify fetch was called (retry disabled means it shouldn't retry)
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('CSRF token handling', () => {
    let mockSessionStorage: Record<string, string>;
    let mockAddCsrfTokenToHeaders: (headers: Record<string, string>) => Record<string, string>;
    let mockSetCsrfTokenFromResponse: (response: Response) => void;

    beforeEach(() => {
      // Mock sessionStorage
      mockSessionStorage = {};
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: (key: string) => mockSessionStorage[key] || null,
          setItem: (key: string, value: string) => {
            mockSessionStorage[key] = value;
          },
          removeItem: (key: string) => {
            delete mockSessionStorage[key];
          },
          clear: () => {
            mockSessionStorage = {};
          },
        },
        writable: true,
        configurable: true,
      });

      // Mock CSRF token manager functions
      mockAddCsrfTokenToHeaders = vi.fn((headers: Record<string, string>) => {
        const token = mockSessionStorage['catchup_feed_csrf_token'];
        if (token) {
          return { ...headers, 'X-CSRF-Token': token };
        }
        return headers;
      });
      mockSetCsrfTokenFromResponse = vi.fn((response: Response) => {
        const token = response.headers.get('X-CSRF-Token');
        if (token) {
          mockSessionStorage['catchup_feed_csrf_token'] = token;
        }
      });

      vi.spyOn(CsrfTokenManager, 'addCsrfTokenToHeaders').mockImplementation(
        mockAddCsrfTokenToHeaders
      );
      vi.spyOn(CsrfTokenManager, 'setCsrfTokenFromResponse').mockImplementation(
        mockSetCsrfTokenFromResponse
      );

      // Mock successful fetch response with CSRF token
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-length': '20',
          'X-CSRF-Token': 'test-csrf-token-123',
        }),
        text: async () => JSON.stringify({ success: true }),
      });
    });

    afterEach(() => {
      // Clear sessionStorage
      mockSessionStorage = {};
    });

    it('should include CSRF token in POST requests', async () => {
      // Arrange - Set token in sessionStorage
      mockSessionStorage['catchup_feed_csrf_token'] = 'existing-csrf-token';

      // Act
      await apiClient.post('/test-endpoint', { data: 'test' });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-CSRF-Token': 'existing-csrf-token',
          }),
        })
      );
    });

    it('should include CSRF token in PUT requests', async () => {
      // Arrange - Set token in sessionStorage
      mockSessionStorage['catchup_feed_csrf_token'] = 'existing-csrf-token';

      // Act
      await apiClient.put('/test-endpoint', { data: 'test' });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'X-CSRF-Token': 'existing-csrf-token',
          }),
        })
      );
    });

    it('should include CSRF token in PATCH requests', async () => {
      // Arrange - Set token in sessionStorage
      mockSessionStorage['catchup_feed_csrf_token'] = 'existing-csrf-token';

      // Act
      await apiClient.request('/test-endpoint', {
        method: 'PATCH',
        body: { data: 'test' },
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'X-CSRF-Token': 'existing-csrf-token',
          }),
        })
      );
    });

    it('should include CSRF token in DELETE requests', async () => {
      // Arrange - Set token in sessionStorage
      mockSessionStorage['catchup_feed_csrf_token'] = 'existing-csrf-token';

      // Act
      await apiClient.delete('/test-endpoint');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-CSRF-Token': 'existing-csrf-token',
          }),
        })
      );
    });

    it('should NOT include CSRF token in GET requests', async () => {
      // Arrange - Set token in sessionStorage
      mockSessionStorage['catchup_feed_csrf_token'] = 'existing-csrf-token';

      // Act
      await apiClient.get('/test-endpoint');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.not.objectContaining({
            'X-CSRF-Token': expect.anything(),
          }),
        })
      );
    });

    it('should extract CSRF token from response headers', async () => {
      // Arrange - Response with CSRF token header
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-length': '20',
          'X-CSRF-Token': 'new-csrf-token-456',
        }),
        text: async () => JSON.stringify({ success: true }),
      });

      // Act
      await apiClient.get('/test-endpoint');

      // Assert - Token should be stored in sessionStorage
      expect(mockSessionStorage['catchup_feed_csrf_token']).toBe('new-csrf-token-456');
    });

    it('should handle missing CSRF token gracefully in POST requests', async () => {
      // Arrange - No token in sessionStorage
      mockSessionStorage = {};

      // Act
      await apiClient.post('/test-endpoint', { data: 'test' });

      // Assert - Request should still be made without CSRF token
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: expect.not.objectContaining({
            'X-CSRF-Token': expect.anything(),
          }),
        })
      );
    });
  });

  describe('CSRF Error Recovery', () => {
    beforeEach(() => {
      // Mock sessionStorage
      const sessionStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => {
            store[key] = value;
          },
          removeItem: (key: string) => {
            delete store[key];
          },
          clear: () => {
            store = {};
          },
        };
      })();

      Object.defineProperty(window, 'sessionStorage', {
        value: sessionStorageMock,
        writable: true,
      });

      // Mock window.location.reload
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
          reload: vi.fn(),
        },
        writable: true,
      });
    });

    it('should detect CSRF validation failure from 403 error', async () => {
      // Arrange
      const clearCsrfTokenSpy = vi.spyOn(CsrfTokenManager, 'clearCsrfToken');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'CSRF token validation failed' }),
        headers: new Headers(),
      });

      // Act & Assert
      const error = (await apiClient
        .request('/test-endpoint', { method: 'POST' })
        .catch((e) => e)) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(403);
      expect(clearCsrfTokenSpy).toHaveBeenCalled();
    });

    it('should reload page on CSRF error', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'CSRF token validation failed' }),
        headers: new Headers(),
      });

      vi.useFakeTimers();

      // Act
      await apiClient.request('/test-endpoint', { method: 'POST' }).catch(() => {});

      // Fast-forward timer
      vi.advanceTimersByTime(100);

      // Assert
      expect(window.location.reload).toHaveBeenCalled();
      expect(sessionStorage.getItem('csrf_reload_attempted')).toBeTruthy();

      vi.useRealTimers();
    });

    it('should not reload on non-CSRF 403 errors', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden - insufficient permissions' }),
        headers: new Headers(),
      });

      vi.useFakeTimers();

      // Act
      await apiClient.request('/test-endpoint', { method: 'POST' }).catch(() => {});

      // Fast-forward timer
      vi.advanceTimersByTime(100);

      // Assert - Should NOT reload (not a CSRF error)
      expect(window.location.reload).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should not retry CSRF errors', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'CSRF token validation failed' }),
        headers: new Headers(),
      });

      // Act
      await apiClient
        .request('/test-endpoint', {
          method: 'POST',
          retry: { maxRetries: 3 },
        })
        .catch(() => {});

      // Assert - Should only call fetch once (no retries for CSRF errors)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should set CSRF error flag in sessionStorage', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'CSRF token validation failed' }),
        headers: new Headers(),
      });

      // Act
      await apiClient.request('/test-endpoint', { method: 'POST' }).catch(() => {});

      // Assert
      expect(sessionStorage.getItem('csrf_error_occurred')).toBe('true');
    });
  });
});
