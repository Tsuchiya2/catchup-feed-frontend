/**
 * Learning (spaced repetition) hooks
 *
 * React Query hooks for the grading page, tracker, and book management.
 *
 * Cache design:
 * - ['learning', 'reviews', 'pending']   - pending review queue (grading)
 * - ['learning', 'items', status]        - tracker list per status
 * - ['learning', 'books']                - book manager list
 *
 * Grading is optimistic: the visible card advances instantly (driven by the
 * caller's local "processed" set), and the pending log is removed from the
 * cache on mutate so it never reappears. A 409 (already graded elsewhere —
 * another device or the 48h auto-advance) is treated as success and quietly
 * skipped; any other failure rolls the cache back so a genuinely-ungraded
 * item can resurface on the next visit.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPendingReviews,
  gradeReview,
  getLearningItems,
  retireLearningItem,
  getLearningBooks,
  activateBook,
  deactivateBook,
} from '@/lib/api/endpoints/learning';
import { ApiError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';
import type {
  PendingReview,
  GradeResult,
  LearningItem,
  LearningItemStatus,
  LearningBook,
} from '@/types/api';

const PENDING_KEY = ['learning', 'reviews', 'pending'] as const;

/**
 * Fetch the pending review queue (oldest first). Empty = nothing to grade
 * today (a normal state, surfaced as a friendly empty view — not an error).
 */
export function usePendingReviews(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: PENDING_KEY,
    queryFn: getPendingReviews,
    // Keep the deck stable while grading; don't refetch mid-session.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Grade a review (○△×). One-shot on the backend; optimistic on the client.
 *
 * The caller advances the UI locally the instant a grade is tapped. This
 * mutation keeps the cache consistent: it drops the graded log from the
 * pending list on mutate, keeps it dropped on success or 409, and restores
 * it on any other error.
 */
export function useGradeReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ logId, result }: { logId: number; result: GradeResult }) =>
      gradeReview(logId, result),
    onMutate: async ({ logId }) => {
      // Cancel in-flight refetches so they don't clobber our optimistic drop.
      await queryClient.cancelQueries({ queryKey: PENDING_KEY });
      const previous = queryClient.getQueryData<PendingReview[]>(PENDING_KEY);
      queryClient.setQueryData<PendingReview[]>(PENDING_KEY, (old) =>
        (old ?? []).filter((r) => r.log_id !== logId)
      );
      return { previous };
    },
    onError: (error, { logId }, context) => {
      // 409 = already graded (another device / 48h auto). Correct to skip —
      // leave it dropped from the queue.
      if (error instanceof ApiError && error.status === 409) {
        logger.debug('Review already graded, skipping', { logId });
        return;
      }
      // Genuine failure: roll the pending list back so the item isn't lost.
      // (The caller's local "processed" set still hides it for this session;
      // it resurfaces on the next visit / refetch.)
      if (context?.previous) {
        queryClient.setQueryData(PENDING_KEY, context.previous);
      }
    },
    onSuccess: () => {
      // The item's stage/due_on changed — refresh the tracker lazily.
      queryClient.invalidateQueries({ queryKey: ['learning', 'items'] });
    },
  });

  return {
    grade: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

/**
 * Fetch tracker items filtered by status (active / retired).
 */
export function useLearningItems(status: LearningItemStatus, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['learning', 'items', status],
    queryFn: () => getLearningItems(status),
    staleTime: 30000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    items: (query.data ?? []) as LearningItem[],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Manually retire (archive) a learning item. Idempotent.
 */
export function useRetireItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => retireLearningItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'items'] });
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
 * Fetch ingested books with review progress.
 */
export function useLearningBooks(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['learning', 'books'],
    queryFn: getLearningBooks,
    staleTime: 30000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    books: (query.data ?? []) as LearningBook[],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Activate a book (set as the single in-progress book — an implicit
 * swap with whatever was active). Activating a finished book restarts it.
 */
export function useActivateBook() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => activateBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'books'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
  };
}

/**
 * Deactivate a book (pause / remove from rotation, cursor kept). Idempotent.
 */
export function useDeactivateBook() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => deactivateBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', 'books'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
