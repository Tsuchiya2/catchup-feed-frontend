import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, logout } from '../auth';
import { apiClient } from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls POST /auth/token with credentials and requiresAuth: false', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ token: 'jwt-abc' });

      const result = await login('admin@example.com', 'secret');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/token',
        { email: 'admin@example.com', password: 'secret' },
        { requiresAuth: false }
      );
      expect(result).toEqual({ token: 'jwt-abc' });
    });

    it('does NOT touch localStorage / document.cookie with the JWT (H-1)', async () => {
      // Guard against regressions: the body token must never be persisted.
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const cookieSetter = vi.fn();
      const cookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get: () => '',
        set: cookieSetter,
      });

      vi.mocked(apiClient.post).mockResolvedValue({ token: 'jwt-secret-value' });

      await login('admin@example.com', 'secret');

      // No JWT written to localStorage/sessionStorage.
      const wroteJwt = setItemSpy.mock.calls.some(([, value]) =>
        String(value).includes('jwt-secret-value')
      );
      expect(wroteJwt).toBe(false);
      // No cookie written at all from the login endpoint.
      expect(cookieSetter).not.toHaveBeenCalled();

      // Restore
      if (cookieDescriptor) {
        Object.defineProperty(document, 'cookie', cookieDescriptor);
      }
      setItemSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('calls POST /auth/logout so the backend expires the HttpOnly cookie', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(undefined);

      await logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', undefined, {
        requiresAuth: false,
        retry: false,
      });
    });

    it('propagates errors so callers can fall back to best-effort cleanup', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('network down'));

      await expect(logout()).rejects.toThrow('network down');
    });
  });
});
