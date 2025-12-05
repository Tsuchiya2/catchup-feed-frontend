import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  isTokenExpired,
  isAuthenticated,
} from './token';

describe('Token Storage Utilities', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    vi.clearAllMocks();

    // Mock global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Suppress console errors/warnings in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAuthToken', () => {
    it('should retrieve token from localStorage', () => {
      // Arrange
      const token = 'test-token-123';
      localStorageMock.setItem('catchup_feed_auth_token', token);

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBe(token);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('catchup_feed_auth_token');
    });

    it('should return null when no token exists', () => {
      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when localStorage throws error', () => {
      // Arrange
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage is not available');
      });

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should return null on server-side (window undefined)', () => {
      // Arrange
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      // Act
      const result = getAuthToken();

      // Assert
      expect(result).toBeNull();

      // Cleanup
      global.window = originalWindow;
    });
  });

  describe('setAuthToken', () => {
    it('should store token in localStorage', () => {
      // Arrange
      const token = 'new-test-token';

      // Act
      setAuthToken(token);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('catchup_feed_auth_token', token);
      expect(localStorageMock.getItem('catchup_feed_auth_token')).toBe(token);
    });

    it('should overwrite existing token', () => {
      // Arrange
      localStorageMock.setItem('catchup_feed_auth_token', 'old-token');
      const newToken = 'new-token';

      // Act
      setAuthToken(newToken);

      // Assert
      expect(localStorageMock.getItem('catchup_feed_auth_token')).toBe(newToken);
    });

    it('should throw error when localStorage.setItem fails', () => {
      // Arrange
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage quota exceeded');
      });

      // Act & Assert
      expect(() => setAuthToken('token')).toThrow('Failed to store authentication token');
      expect(console.error).toHaveBeenCalled();
    });

    it('should warn when called on server-side', () => {
      // Arrange
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      // Act
      setAuthToken('token');

      // Assert
      expect(console.warn).toHaveBeenCalledWith('Cannot set auth token on server-side');

      // Cleanup
      global.window = originalWindow;
    });
  });

  describe('clearAuthToken', () => {
    it('should remove token from localStorage', () => {
      // Arrange
      localStorageMock.setItem('catchup_feed_auth_token', 'token-to-remove');

      // Act
      clearAuthToken();

      // Assert
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('catchup_feed_auth_token');
      expect(localStorageMock.getItem('catchup_feed_auth_token')).toBeNull();
    });

    it('should not throw error when token does not exist', () => {
      // Act & Assert
      expect(() => clearAuthToken()).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      // Arrange
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      // Act & Assert
      expect(() => clearAuthToken()).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should do nothing on server-side', () => {
      // Arrange
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      // Act & Assert
      expect(() => clearAuthToken()).not.toThrow();

      // Cleanup
      global.window = originalWindow;
    });
  });

  describe('isTokenExpired', () => {
    // Helper function to create a JWT token
    const createJWT = (exp: number) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, userId: '123' }));
      const signature = 'fake-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return false for valid non-expired token', () => {
      // Arrange - token expires in 1 hour
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createJWT(futureExp);

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for expired token', () => {
      // Arrange - token expired 1 hour ago
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createJWT(pastExp);

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for token expiring right now', () => {
      // Arrange - token expires at current second
      const currentExp = Math.floor(Date.now() / 1000);
      const token = createJWT(currentExp);

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for empty token', () => {
      // Act
      const result = isTokenExpired('');

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for whitespace-only token', () => {
      // Act
      const result = isTokenExpired('   ');

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for invalid JWT format (missing parts)', () => {
      // Act
      const result = isTokenExpired('invalid.token');

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for malformed JWT payload', () => {
      // Arrange - invalid base64
      const token = 'header.invalid-base64.signature';

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return true for JWT without exp claim', () => {
      // Arrange
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ userId: '123' })); // No exp
      const signature = 'fake-signature';
      const token = `${header}.${payload}.${signature}`;

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle decoding errors gracefully', () => {
      // Arrange - completely invalid token
      const token = 'not-a-jwt-token';

      // Act
      const result = isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    // Helper function to create a JWT token
    const createJWT = (exp: number) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, userId: '123' }));
      const signature = 'fake-signature';
      return `${header}.${payload}.${signature}`;
    };

    it('should return true when valid token exists', () => {
      // Arrange
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createJWT(futureExp);
      localStorageMock.setItem('catchup_feed_auth_token', token);

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when token is expired', () => {
      // Arrange
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createJWT(pastExp);
      localStorageMock.setItem('catchup_feed_auth_token', token);

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when no token exists', () => {
      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when token is invalid', () => {
      // Arrange
      localStorageMock.setItem('catchup_feed_auth_token', 'invalid-token');

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false on server-side', () => {
      // Arrange
      const originalWindow = global.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      delete global.window;

      // Act
      const result = isAuthenticated();

      // Assert
      expect(result).toBe(false);

      // Cleanup
      global.window = originalWindow;
    });
  });
});
