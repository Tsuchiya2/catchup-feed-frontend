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
 * Source kind: how the source is ingested (Phase 2 multi-modal).
 * 'rss' = regular RSS/Atom feed, 'youtube' / 'podcast' = transcription path.
 */
export type SourceKind = NonNullable<Schemas['internal_handler_http_source.DTO']['kind']>;

/**
 * Source entity.
 * `kind` stays optional for backward compatibility: responses from a backend
 * that predates the Phase 2 migration may omit it, in which case the UI must
 * treat it as 'rss'.
 */
export type Source = Full<Omit<Schemas['internal_handler_http_source.DTO'], 'kind'>> &
  Pick<Schemas['internal_handler_http_source.DTO'], 'kind'>;

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
 * required by backend validation. lang and kind stay optional (the backend
 * defaults omitted kind to 'rss'), though the form always sends kind.
 */
export type CreateSourceInput = Full<
  Omit<Schemas['internal_handler_http_source.CreateRequest'], 'lang' | 'kind'>
> &
  Pick<Schemas['internal_handler_http_source.CreateRequest'], 'lang' | 'kind'>;

/**
 * Input data for updating an existing source (PUT /sources/:id).
 * Derived from the generated UpdateRequest schema; the backend accepts
 * partial input (empty fields are kept as-is), but the edit form always
 * sends the full set, so only lang and kind stay optional here.
 */
export type UpdateSourceInput = Full<
  Omit<Schemas['internal_handler_http_source.UpdateRequest'], 'lang' | 'kind'>
> &
  Pick<Schemas['internal_handler_http_source.UpdateRequest'], 'lang' | 'kind'>;

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
  /** Source kind (rss / youtube / podcast; defaults to 'rss') */
  kind: SourceKind;
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
// Learning (spaced repetition) Types
// ============================================================================

/**
 * Self-grading result for a review (○△×).
 * `good` = remembered, `fuzzy` = partial, `forgot` = missed.
 *
 * Note: the backend swagger marks `result` optional, but grading always
 * sends one of these three values (backend is tightening `required`). The
 * UI treats it as a mandatory field regardless of how the type generates.
 */
export type GradeResult = NonNullable<
  Schemas['internal_handler_http_learning.GradeRequest']['result']
>;

/**
 * A pending (ungraded) review shown one card at a time on /learning.
 * Carries the item's concept / question / answer so the card is
 * self-contained.
 */
export type PendingReview = Full<Schemas['internal_handler_http_learning.PendingReviewDTO']>;

/**
 * Response of POST /learning/reviews/:id/grade. Reflects the item's new
 * spaced-repetition state after the grade is applied.
 */
export type GradeResponse = Full<Schemas['internal_handler_http_learning.GradeResponse']>;

/**
 * Learning item kind: derived from a broadcast article or a book chunk.
 */
export type LearningItemKind = NonNullable<
  Schemas['internal_handler_http_learning.ItemDTO']['kind']
>;

/**
 * Filter for the tracker list: current (active) vs graduated/archived.
 */
export type LearningItemStatus = 'active' | 'retired';

/**
 * A learning item in the tracker.
 * `article_id` / `book_id` are set per `kind` (one is null). `retired_at`
 * null = still active. `last_result` / `last_asked_on` are null until the
 * item has been asked at least once.
 */
export type LearningItem = Nullable<
  Schemas['internal_handler_http_learning.ItemDTO'],
  'article_id' | 'book_id' | 'retired_at' | 'last_result' | 'last_asked_on'
>;

/**
 * Response of POST /learning/items/:id/retire (idempotent archive).
 */
export type RetireResponse = Full<Schemas['internal_handler_http_learning.RetireResponse']>;

/**
 * book_review progression status.
 * `idle` = not selected / paused (cursor kept), `active` = in progress
 * (at most one book at a time), `finished` = fully read.
 */
export type BookReviewStatus = NonNullable<
  Schemas['internal_handler_http_learning.BookDTO']['review_status']
>;

/**
 * An ingested book managed from the dashboard (D-20).
 * `review_cursor` / `total_chunks` drive the progress percentage.
 */
export type LearningBook = Full<Schemas['internal_handler_http_learning.BookDTO']>;

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
