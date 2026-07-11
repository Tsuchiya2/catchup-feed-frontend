/**
 * Configuration Module Exports
 *
 * Centralized configuration for the entire application.
 * Import configurations using: import { appConfig, loggingConfig } from '@/config'
 *
 * @module config
 */

// Application Configuration
export {
  appConfig,
  validateConfig,
  type AppConfig,
  type AppIdentity,
  type ApiConfig,
  type AuthConfig,
  type FeatureFlags,
  type EnvironmentConfig,
} from './app.config';

// Logging Configuration
export {
  loggingConfig,
  logLevels,
  shouldLogLevel,
  shouldSample,
  type LogLevel,
  type LogFormat,
  type LoggingConfig,
} from './logging.config';

// Security Configuration is defined directly in next.config.ts (see the
// Content-Security-Policy header). The former security.config.ts duplicate was
// unused and removed to keep a single source of truth (M-1).

// Source Configuration
export { SOURCE_CONFIG, type SourceConfig } from './sourceConfig';
