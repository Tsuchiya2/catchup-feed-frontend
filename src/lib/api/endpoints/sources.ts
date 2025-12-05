/**
 * Sources API Endpoints
 *
 * Functions for fetching sources from the API.
 */

import { apiClient } from '@/lib/api/client';
import type { Source, SourcesResponse, SourceResponse } from '@/types/api';

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
 * Fetch a single source by ID
 *
 * @param id - Source ID (number)
 * @returns Promise resolving to source response
 * @throws {ApiError} When the source is not found or request fails
 *
 * @example
 * ```typescript
 * try {
 *   const source = await getSource(1);
 *   console.log('Source:', source);
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 404) {
 *     console.error('Source not found');
 *   }
 * }
 * ```
 */
export async function getSource(id: number): Promise<SourceResponse> {
  const endpoint = `/sources/${id}`;

  const response = await apiClient.get<SourceResponse>(endpoint);
  return response;
}

/**
 * Export types for convenience
 */
export type { Source, SourcesResponse, SourceResponse };
