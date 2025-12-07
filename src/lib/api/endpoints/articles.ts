/**
 * Articles API Endpoints
 *
 * Functions for fetching articles from the API.
 */

import { apiClient } from '@/lib/api/client';
import type { Article, ArticlesQuery, ArticlesResponse, ArticleResponse } from '@/types/api';

/**
 * Search parameters for article search
 */
export interface ArticleSearchParams {
  keyword?: string;
  source_id?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
import { validateArticle, normalizeSourceName } from '@/utils/article';
import { ArticleMigrationLogger } from '@/utils/logger';

/**
 * Build query string from query parameters
 *
 * @param query - Query parameters object
 * @returns Query string (e.g., '?page=1&limit=10')
 */
function buildQueryString(query?: ArticlesQuery): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.append('page', query.page.toString());
  }

  if (query.limit !== undefined) {
    params.append('limit', query.limit.toString());
  }

  if (query.source_id !== undefined) {
    params.append('source_id', query.source_id.toString());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build query string for article search
 *
 * @param params - Search parameters object
 * @returns Query string (e.g., '?keyword=test&page=1&limit=10')
 */
function buildSearchQueryString(params?: ArticleSearchParams): string {
  if (!params) {
    return '';
  }

  const queryParams = new URLSearchParams();

  if (params.keyword !== undefined) {
    queryParams.append('keyword', params.keyword);
  }

  if (params.source_id !== undefined) {
    queryParams.append('source_id', params.source_id.toString());
  }

  if (params.from !== undefined) {
    queryParams.append('from', params.from);
  }

  if (params.to !== undefined) {
    queryParams.append('to', params.to);
  }

  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString());
  }

  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetch a paginated list of articles
 *
 * @param query - Query parameters (page, limit, sourceId)
 * @returns Promise resolving to articles response with pagination info
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * // Get first page with default limit
 * const response = await getArticles({ page: 1 });
 *
 * // Get articles from specific source
 * const response = await getArticles({ sourceId: 'source-id', limit: 20 });
 * ```
 */
export async function getArticles(query?: ArticlesQuery): Promise<ArticlesResponse> {
  const queryString = buildQueryString(query);
  const endpoint = `/articles${queryString}`;

  const response = await apiClient.get<ArticlesResponse>(endpoint);

  // Log API response for debugging
  ArticleMigrationLogger.debugApiResponse(endpoint, response.length);

  // Validate and normalize each article
  const validatedArticles: Article[] = [];

  for (const article of response) {
    if (!validateArticle(article)) {
      ArticleMigrationLogger.errorValidationFailed(
        (article as Article | undefined)?.id ?? 0,
        'Invalid article structure'
      );
      continue; // Skip invalid articles instead of throwing
    }

    // Normalize source_name
    const originalSourceName = article.source_name;
    const normalizedSourceName = normalizeSourceName(article.source_name);

    if (originalSourceName !== normalizedSourceName) {
      ArticleMigrationLogger.infoSourceNameNormalized(
        article.id,
        originalSourceName,
        normalizedSourceName
      );
    }

    validatedArticles.push({
      ...article,
      source_name: normalizedSourceName,
    });
  }

  return validatedArticles;
}

/**
 * Search articles with various filters
 *
 * @param params - Search parameters (keyword, source_id, from, to, page, limit)
 * @returns Promise resolving to articles response
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * // Search by keyword
 * const response = await searchArticles({ keyword: 'typescript' });
 *
 * // Search with date range and source filter
 * const response = await searchArticles({
 *   keyword: 'react',
 *   source_id: 1,
 *   from: '2025-01-01',
 *   to: '2025-12-31',
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function searchArticles(params?: ArticleSearchParams): Promise<ArticlesResponse> {
  const queryString = buildSearchQueryString(params);
  const endpoint = `/articles/search${queryString}`;

  const response = await apiClient.get<ArticlesResponse>(endpoint);

  // Log API response for debugging
  ArticleMigrationLogger.debugApiResponse(endpoint, response.length);

  // Validate and normalize each article
  const validatedArticles: Article[] = [];

  for (const article of response) {
    if (!validateArticle(article)) {
      ArticleMigrationLogger.errorValidationFailed(
        (article as Article | undefined)?.id ?? 0,
        'Invalid article structure'
      );
      continue; // Skip invalid articles instead of throwing
    }

    // Normalize source_name
    const originalSourceName = article.source_name;
    const normalizedSourceName = normalizeSourceName(article.source_name);

    if (originalSourceName !== normalizedSourceName) {
      ArticleMigrationLogger.infoSourceNameNormalized(
        article.id,
        originalSourceName,
        normalizedSourceName
      );
    }

    validatedArticles.push({
      ...article,
      source_name: normalizedSourceName,
    });
  }

  return validatedArticles;
}

/**
 * Fetch a single article by ID
 *
 * @param id - Article ID (number)
 * @returns Promise resolving to article response
 * @throws {ApiError} When the article is not found or request fails
 *
 * @example
 * ```typescript
 * try {
 *   const article = await getArticle(1);
 *   console.log('Article:', article);
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 404) {
 *     console.error('Article not found');
 *   }
 * }
 * ```
 */
export async function getArticle(id: number): Promise<ArticleResponse> {
  const endpoint = `/articles/${id}`;

  const article = await apiClient.get<ArticleResponse>(endpoint);

  // Validate article structure
  if (!validateArticle(article)) {
    ArticleMigrationLogger.errorValidationFailed(
      (article as Article | undefined)?.id ?? id,
      'Invalid article structure'
    );
    throw new Error('Invalid article response');
  }

  // Normalize source_name
  const originalSourceName = article.source_name;
  const normalizedSourceName = normalizeSourceName(article.source_name);

  if (originalSourceName !== normalizedSourceName) {
    ArticleMigrationLogger.infoSourceNameNormalized(
      article.id,
      originalSourceName,
      normalizedSourceName
    );
  }

  const normalizedArticle = {
    ...article,
    source_name: normalizedSourceName,
  };

  return normalizedArticle;
}

/**
 * Export types for convenience
 */
export type { Article, ArticlesQuery, ArticlesResponse, ArticleResponse };
