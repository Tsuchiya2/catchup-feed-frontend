/**
 * Viewer (read-only account, D-27) hooks
 *
 * React Query hooks for the admin-only viewer CRUD.
 *
 * Cache design:
 * - ['viewers'] - list (single flat list; no per-viewer detail endpoint)
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getViewers,
  createViewer,
  updateViewer,
  setViewerActive,
  deleteViewer,
} from '@/lib/api/endpoints/viewers';
import type { ViewerCreateInput, ViewerUpdateInput } from '@/types/api';

/**
 * Fetch all viewers (active and deactivated).
 */
export function useViewers(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['viewers'],
    queryFn: getViewers,
    staleTime: 60000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    viewers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Create a viewer (name, email and initial password all required).
 */
export function useCreateViewer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: ViewerCreateInput) => createViewer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewers'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}

/**
 * Update a viewer's name/email; password only resets when provided.
 */
export function useUpdateViewer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ViewerUpdateInput }) =>
      updateViewer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewers'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}

/**
 * Toggle a viewer's active state (logical deactivation — reversible,
 * enforced on their next request without waiting for JWT expiry).
 */
export function useSetViewerActive() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => setViewerActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewers'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}

/**
 * Delete a viewer PERMANENTLY (physical delete — confirm with the user
 * first; there is no undo).
 */
export function useDeleteViewer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => deleteViewer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewers'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
