/**
 * Access Logs API Endpoints
 *
 * Read-only views over feed access logs (who fetched the feed / episodes
 * and when). Used for the neglect-detection dashboard: the project goal is
 * feedback from friends, so spotting "no access for 3 weeks" matters more
 * than raw traffic numbers.
 */

import { apiClient } from '@/lib/api/client';
import type { AccessLog, AccessLogSummary } from '@/types/api';

/**
 * Query parameters for the access log list
 */
export interface AccessLogsParams {
  /** Filter by subscriber (friend) ID */
  subscriber_id?: number;
  /** Number of rows to fetch (backend default 100, max 1000) */
  limit?: number;
}

/**
 * Build query string for access logs
 */
function buildAccessLogsQueryString(params?: AccessLogsParams): string {
  if (!params) {
    return '';
  }

  const queryParams = new URLSearchParams();

  if (params.subscriber_id !== undefined) {
    queryParams.append('subscriber_id', params.subscriber_id.toString());
  }

  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetch access logs, newest first.
 *
 * @param params - Optional subscriber filter and row limit
 * @returns Promise resolving to access log rows (newest first)
 * @throws {ApiError} When the request fails
 */
export async function getAccessLogs(params?: AccessLogsParams): Promise<AccessLog[]> {
  const endpoint = `/access-logs${buildAccessLogsQueryString(params)}`;
  return apiClient.get<AccessLog[]>(endpoint);
}

/**
 * Fetch the per-subscriber access summary.
 *
 * One row per subscriber: last access, days since last access, and
 * 7/30-day access counts. `last_accessed_at` / `days_since_last_access`
 * are null for friends who have never fetched the feed.
 *
 * @returns Promise resolving to summary rows
 * @throws {ApiError} When the request fails
 */
export async function getAccessLogSummary(): Promise<AccessLogSummary[]> {
  return apiClient.get<AccessLogSummary[]>('/access-logs/summary');
}

/**
 * Export types for convenience
 */
export type { AccessLog, AccessLogSummary };
