/**
 * API Type Definitions
 *
 * Friendly aliases over the generated OpenAPI types.
 *
 * The contract source of truth is `src/types/generated/api.d.ts`, generated
 * from the backend Swagger spec via:
 *
 *   npm run generate:api [-- <path-or-url-to-swagger.json>]
 *
 * This file only renames/derives from the generated schemas so app code can
 * use stable, readable names. Do not hand-write API shapes here; if the
 * backend contract changes, regenerate first, then adjust the aliases.
 *
 * Note on optionality: the backend emits Swagger 2.0 without `required`
 * markers, so every generated field is optional. The helpers below restore
 * required-ness (backend DTOs serialize all fields) and mark pointer-backed
 * fields as `| null`.
 */

import type { components } from './generated/api';

type Schemas = components['schemas'];

/**
 * All fields required (backend DTOs always serialize every field).
 */
type Full<T> = Required<T>;

/**
 * All fields required, but keys K are nullable (backed by Go pointers,
 * serialized as `null` when unset).
 */
type Nullable<T, K extends keyof T> = Omit<Required<T>, K> & {
  [P in K]-?: NonNullable<T[P]> | null;
};

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Login request payload
 */
export type LoginRequest = Full<Schemas['internal_handler_http_auth.loginRequest']>;

/**
 * Login response with JWT token
 * Note: Backend returns only token, refresh_token is a frontend extension
 */
export interface LoginResponse {
  token: string;
  refresh_token?: string;
}

/**
 * Token refresh request payload (frontend-internal)
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Token refresh response (frontend-internal)
 */
export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

/**
 * Token validation response (frontend-internal)
 */
export interface TokenValidationResponse {
  valid: boolean;
  userId?: string;
  email?: string;
}

// ============================================================================
// Article Types
// ============================================================================

/**
 * Article entity (title + summary only; the API does not return content)
 */
export type Article = Full<Schemas['internal_handler_http_article.DTO']>;

/**
 * Query parameters for fetching articles
 */
export interface ArticlesQuery {
  page?: number;
  limit?: number;
  source_id?: number;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination metadata from backend API
 */
export type PaginationMetadata = Full<Schemas['catchup-feed_internal_common_pagination.Metadata']>;

/**
 * Generic paginated response wrapper
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMetadata;
}

/**
 * Paginated articles response
 */
export interface PaginatedArticlesResponse extends PaginatedResponse<Article> {}

/**
 * Articles list response
 */
export type ArticlesResponse = PaginatedArticlesResponse;

/**
 * Single article response
 */
export type ArticleResponse = Article;

// ============================================================================
// Source Types
// ============================================================================

/**
 * Source entity
 */
export type Source = Full<Schemas['internal_handler_http_source.DTO']>;

/**
 * Sources list response (backend returns a bare array)
 */
export type SourcesResponse = Source[];

/**
 * Single source response
 */
export type SourceResponse = Source;

/**
 * Input data for creating a new source (POST /sources).
 * Derived from the generated CreateRequest schema; name/feedURL/category are
 * required by backend validation, lang stays optional.
 */
export type CreateSourceInput = Full<
  Omit<Schemas['internal_handler_http_source.CreateRequest'], 'lang'>
> &
  Pick<Schemas['internal_handler_http_source.CreateRequest'], 'lang'>;

/**
 * Input data for updating an existing source (PUT /sources/:id).
 * Derived from the generated UpdateRequest schema; the backend accepts
 * partial input (empty fields are kept as-is), but the edit form always
 * sends the full set, so only lang stays optional here.
 */
export type UpdateSourceInput = Full<
  Omit<Schemas['internal_handler_http_source.UpdateRequest'], 'lang'>
> &
  Pick<Schemas['internal_handler_http_source.UpdateRequest'], 'lang'>;

/**
 * Form field state for source creation and editing
 * Used internally by SourceForm component
 */
export interface SourceFormData {
  /** Source name */
  name: string;
  /** RSS/Atom feed URL */
  feedURL: string;
  /** Category (required) */
  category: string;
  /** Content language (optional) */
  lang: string;
}

/**
 * Form validation errors for source creation
 */
export interface SourceFormErrors {
  /** Error message for name field */
  name?: string;
  /** Error message for feedURL field */
  feedURL?: string;
  /** Error message for category field */
  category?: string;
  /** Error message for lang field */
  lang?: string;
}

// ============================================================================
// Subscriber (friend) Types
// ============================================================================

/**
 * Subscriber (friend) entity.
 * `deactivated_at` set = soft-deleted (deactivated), never hard-deleted.
 */
export type Subscriber = Nullable<
  Schemas['internal_handler_http_subscriber.DTO'],
  'email' | 'note' | 'deactivated_at'
>;

/**
 * Create/update body for subscribers.
 * PUT /subscribers/:id is a FULL REPLACEMENT: always send every field.
 */
export type SubscriberInput = Nullable<
  Schemas['internal_handler_http_subscriber.Request'],
  'email' | 'note'
>;

// ============================================================================
// Feed Token Types
// ============================================================================

/**
 * Feed token as listed by GET /subscribers/:id/tokens.
 * Plaintext token is NEVER included (D-5: hash-only storage).
 */
export type FeedToken = Nullable<
  Schemas['internal_handler_http_subscriber.TokenDTO'],
  'revoked_at'
>;

/**
 * Response of POST /subscribers/:id/tokens.
 * `token` and `feed_url` are shown exactly once and can never be
 * retrieved again (D-5). Losing them requires revoke + re-issue.
 */
export type IssuedFeedToken = Nullable<
  Schemas['internal_handler_http_subscriber.IssuedTokenDTO'],
  'revoked_at'
>;

/**
 * Response of DELETE /tokens/:id (revocation is irreversible).
 */
export type RevokedFeedToken = Full<Schemas['internal_handler_http_subscriber.RevokedTokenDTO']>;

// ============================================================================
// Access Log Types
// ============================================================================

/**
 * A single feed access record.
 * `episode_id` null = feed.xml fetch, otherwise an episode mp3 download.
 */
export type AccessLog = Nullable<
  Schemas['internal_handler_http_accesslog.DTO'],
  'episode_id' | 'user_agent'
>;

/**
 * Per-subscriber access summary (GET /access-logs/summary).
 * `last_accessed_at` / `days_since_last_access` are null when the
 * subscriber has never accessed the feed.
 */
export type AccessLogSummary = Nullable<
  Schemas['internal_handler_http_accesslog.SummaryDTO'],
  'last_accessed_at' | 'days_since_last_access'
>;

// ============================================================================
// Error Types
// ============================================================================

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Common Types
// ============================================================================

/**
 * Pagination information (frontend format with camelCase)
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: ApiErrorResponse;
}
