/**
 * Sources API Endpoints
 *
 * Functions for fetching sources from the API.
 */

import { apiClient } from '@/lib/api/client';
import type {
  Source,
  SourcesResponse,
  SourceResponse,
  CreateSourceInput,
  UpdateSourceInput,
} from '@/types/api';

/**
 * Search parameters for source search
 */
export interface SourceSearchParams {
  keyword?: string;
  category?: string;
  active?: boolean;
}

/**
 * Build query string for source search
 *
 * @param params - Search parameters object
 * @returns Query string (e.g., '?keyword=test&category=dev')
 */
function buildSourceSearchQueryString(params?: SourceSearchParams): string {
  if (!params) {
    return '';
  }

  const queryParams = new URLSearchParams();

  if (params.keyword !== undefined) {
    queryParams.append('keyword', params.keyword);
  }

  if (params.category !== undefined) {
    queryParams.append('category', params.category);
  }

  if (params.active !== undefined) {
    queryParams.append('active', params.active.toString());
  }

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetch all sources
 *
 * @returns Promise resolving to sources response
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * try {
 *   const response = await getSources();
 *   console.log('Sources:', response.sources);
 * } catch (error) {
 *   console.error('Failed to fetch sources:', error);
 * }
 * ```
 */
export async function getSources(): Promise<SourcesResponse> {
  const endpoint = '/sources';

  const response = await apiClient.get<SourcesResponse>(endpoint);
  return response;
}

/**
 * Search sources with various filters
 *
 * @param params - Search parameters (keyword, category, active)
 * @returns Promise resolving to sources response
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * // Search by keyword
 * const response = await searchSources({ keyword: 'tech' });
 *
 * // Search with filters
 * const response = await searchSources({
 *   keyword: 'blog',
 *   category: 'dev',
 *   active: true
 * });
 * ```
 */
export async function searchSources(params?: SourceSearchParams): Promise<SourcesResponse> {
  const queryString = buildSourceSearchQueryString(params);
  const endpoint = `/sources/search${queryString}`;

  const response = await apiClient.get<SourcesResponse>(endpoint);
  return response;
}

/**
 * Update source active status
 *
 * PUT /sources/:id accepts partial input on the backend (empty fields are
 * kept as-is), so sending only `active` toggles the status.
 * The backend responds 204 No Content.
 *
 * @param id - Source ID
 * @param active - New active status
 * @returns Promise resolving when the update completes
 * @throws {ApiError} When the request fails
 *
 * @example
 * ```typescript
 * try {
 *   await updateSourceActive(1, false);
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 403) {
 *     console.error('Permission denied');
 *   }
 * }
 * ```
 */
export async function updateSourceActive(id: number, active: boolean): Promise<void> {
  const endpoint = `/sources/${id}`;
  await apiClient.put<void>(endpoint, { active });
}

/**
 * Create a new source
 *
 * @param data - Source creation input (name and feedURL)
 * @returns Promise resolving when creation is complete
 * @throws {ApiError} When the request fails (400, 401, 403, 500)
 *
 * @example
 * ```typescript
 * try {
 *   await createSource({
 *     name: 'Tech Blog',
 *     feedURL: 'https://techblog.com/feed.xml'
 *   });
 *   console.log('Source created successfully');
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 403) {
 *     console.error('Permission denied - admin access required');
 *   }
 * }
 * ```
 */
export async function createSource(data: CreateSourceInput): Promise<void> {
  const endpoint = '/sources';
  await apiClient.post(endpoint, data);
}

/**
 * Update an existing source
 *
 * The backend responds 204 No Content.
 *
 * @param id - Source ID
 * @param data - Source update input (name, feedURL, category, lang, active)
 * @returns Promise resolving when the update completes
 * @throws {ApiError} When the request fails (400, 401, 403, 404, 500)
 *
 * @example
 * ```typescript
 * try {
 *   await updateSource(1, {
 *     name: 'Updated Tech Blog',
 *     feedURL: 'https://techblog.com/new-feed.xml',
 *     category: 'dev',
 *     lang: 'en',
 *     active: true
 *   });
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 403) {
 *     console.error('Permission denied - admin access required');
 *   } else if (error instanceof ApiError && error.status === 404) {
 *     console.error('Source not found');
 *   }
 * }
 * ```
 */
export async function updateSource(id: number, data: UpdateSourceInput): Promise<void> {
  const endpoint = `/sources/${id}`;
  await apiClient.put<void>(endpoint, data);
}

/**
 * Delete a source
 *
 * @param id - Source ID
 * @returns Promise resolving when deletion is complete
 * @throws {ApiError} When the request fails (401, 403, 404, 500)
 *
 * @example
 * ```typescript
 * try {
 *   await deleteSource(1);
 *   console.log('Source deleted successfully');
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 403) {
 *     console.error('Permission denied - admin access required');
 *   } else if (error instanceof ApiError && error.status === 404) {
 *     console.error('Source not found');
 *   }
 * }
 * ```
 */
export async function deleteSource(id: number): Promise<void> {
  const endpoint = `/sources/${id}`;
  await apiClient.delete(endpoint);
}

/**
 * Export types for convenience
 */
export type { Source, SourcesResponse, SourceResponse, CreateSourceInput, UpdateSourceInput };
