/**
 * API Error Handling
 *
 * Custom error classes for API request failures.
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly status: number;

  /**
   * Additional error details from the API
   */
  public readonly details?: Record<string, unknown>;

  /**
   * Create a new API error
   *
   * @param message - Error message
   * @param status - HTTP status code
   * @param details - Additional error details
   */
  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if this is an authentication error (401)
   */
  public isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if this is a server error (5xx)
   */
  public isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if this is a client error (4xx)
   */
  public isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

/**
 * Network error class for connection failures
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Timeout error class for request timeouts
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}
