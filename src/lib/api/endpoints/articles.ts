/**
 * Articles API Endpoints
 *
 * Functions for fetching articles from the API.
 */

import { apiClient } from '@/lib/api/client';
import type { Article, ArticlesQuery, ArticlesResponse, ArticleResponse } from '@/types/api';

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
  return response;
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

  const response = await apiClient.get<ArticleResponse>(endpoint);
  return response;
}

/**
 * Export types for convenience
 */
export type { Article, ArticlesQuery, ArticlesResponse, ArticleResponse };
