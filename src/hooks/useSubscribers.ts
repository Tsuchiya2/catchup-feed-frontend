/**
 * Subscriber (friend) hooks
 *
 * React Query hooks for subscriber CRUD and feed token management.
 *
 * Cache design:
 * - ['subscribers']            - list
 * - ['subscribers', id]        - detail
 * - ['subscribers', id, 'tokens'] - token list per subscriber
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSubscribers,
  getSubscriber,
  createSubscriber,
  updateSubscriber,
  deactivateSubscriber,
  getSubscriberTokens,
  issueToken,
  revokeToken,
} from '@/lib/api/endpoints/subscribers';
import type { Subscriber, SubscriberInput, FeedToken, IssuedFeedToken } from '@/types/api';

/**
 * Fetch all subscribers (active and deactivated).
 */
export function useSubscribers(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['subscribers'],
    queryFn: getSubscribers,
    staleTime: 60000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    subscribers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Fetch a single subscriber by ID.
 */
export function useSubscriber(id: number, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['subscribers', id],
    queryFn: () => getSubscriber(id),
    staleTime: 60000,
    retry: 1,
    enabled: (options?.enabled ?? true) && Number.isFinite(id) && id > 0,
  });

  return {
    subscriber: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Create a subscriber (name required; email / note optional).
 */
export function useCreateSubscriber() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: SubscriberInput) => createSubscriber(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
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
 * Update a subscriber.
 *
 * PUT is a full replacement on the backend — callers must pass the
 * complete desired state (name, email, note).
 */
export function useUpdateSubscriber() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: SubscriberInput }) =>
      updateSubscriber(id, input),
    onSuccess: (updated: Subscriber) => {
      queryClient.setQueryData(['subscribers', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
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
 * Deactivate a subscriber (soft delete — the record is kept with
 * deactivated_at set; nothing is physically removed).
 */
export function useDeactivateSubscriber() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => deactivateSubscriber(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers', id] });
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
 * List feed tokens for a subscriber (issue date + revocation status only;
 * plaintext tokens are never available here — D-5).
 */
export function useSubscriberTokens(subscriberId: number, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ['subscribers', subscriberId, 'tokens'],
    queryFn: () => getSubscriberTokens(subscriberId),
    staleTime: 30000,
    retry: 1,
    enabled: (options?.enabled ?? true) && Number.isFinite(subscriberId) && subscriberId > 0,
  });

  return {
    tokens: (query.data ?? []) as FeedToken[],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Issue a new feed token.
 *
 * The mutation result carries the ONE-TIME plaintext token and feed URL
 * (D-5). The caller is responsible for showing them immediately; they can
 * never be retrieved again.
 */
export function useIssueToken(subscriberId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (): Promise<IssuedFeedToken> => issueToken(subscriberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers', subscriberId, 'tokens'] });
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
 * Revoke a feed token. IRREVERSIBLE — confirm with the user first.
 */
export function useRevokeToken(subscriberId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (tokenId: number) => revokeToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers', subscriberId, 'tokens'] });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}
