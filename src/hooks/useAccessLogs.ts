/**
 * Access log hooks
 *
 * React Query hooks for the access log timeline and the per-friend
 * neglect-detection summary.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getAccessLogs, getAccessLogSummary } from '@/lib/api/endpoints/accessLogs';
import type { AccessLogsParams } from '@/lib/api/endpoints/accessLogs';

/**
 * Fetch access logs (newest first), optionally filtered by subscriber.
 */
export function useAccessLogs(params?: AccessLogsParams, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['access-logs', params ?? {}],
    queryFn: () => getAccessLogs(params),
    staleTime: 30000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Fetch the per-subscriber access summary (last access, days since,
 * 7/30-day counts). Drives the neglect-detection view.
 */
export function useAccessLogSummary(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['access-logs', 'summary'],
    queryFn: getAccessLogSummary,
    staleTime: 30000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    summary: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

export type { AccessLogsParams };
