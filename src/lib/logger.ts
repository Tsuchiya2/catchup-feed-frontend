/**
 * Structured logging utility for development debugging and production observability
 *
 * Outputs JSON-formatted logs to console with consistent structure:
 * - level: Log level (info, warn, error)
 * - message: Log message
 * - timestamp: ISO 8601 formatted timestamp
 * - context: Optional additional context object
 *
 * @example
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.warn('Rate limit approaching', { remaining: 10 });
 * logger.error('Failed to fetch data', new Error('Network error'), { url: '/api/feeds' });
 */

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

function formatLogEntry(
  level: LogEntry['level'],
  message: string,
  context?: LogContext,
  error?: Error
): string {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (error) {
    entry.error = error.message;
    entry.stack = error.stack;
  }

  return JSON.stringify(entry);
}

export const logger = {
  /**
   * Log an informational message
   * @param message - The log message
   * @param context - Optional additional context
   */
  info: (message: string, context?: LogContext): void => {
    console.log(formatLogEntry('info', message, context));
  },

  /**
   * Log a warning message
   * @param message - The log message
   * @param context - Optional additional context
   */
  warn: (message: string, context?: LogContext): void => {
    console.warn(formatLogEntry('warn', message, context));
  },

  /**
   * Log an error message with optional error object
   * @param message - The log message
   * @param error - Optional Error object for stack trace
   * @param context - Optional additional context
   */
  error: (message: string, error?: Error, context?: LogContext): void => {
    console.error(formatLogEntry('error', message, context, error));
  },
};
