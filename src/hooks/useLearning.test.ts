/**
 * useLearning hook tests
 *
 * Focus on the load-bearing grading logic: optimistic removal from the
 * pending cache, 409 (already graded) being absorbed as a skip, and other
 * errors rolling the cache back.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePendingReviews, useGradeReview } from './useLearning';
import * as learningApi from '@/lib/api/endpoints/learning';
import { ApiError } from '@/lib/api/errors';
import type { PendingReview } from '@/types/api';

vi.mock('@/lib/api/endpoints/learning', () => ({
  getPendingReviews: vi.fn(),
  gradeReview: vi.fn(),
  getLearningItems: vi.fn(),
  retireLearningItem: vi.fn(),
  getLearningBooks: vi.fn(),
  activateBook: vi.fn(),
  deactivateBook: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const PENDING_KEY = ['learning', 'reviews', 'pending'];

const reviews: PendingReview[] = [
  {
    log_id: 1,
    item_id: 10,
    asked_on: '2026-07-07',
    concept: 'A',
    question: 'qa',
    answer: 'aa',
  },
  {
    log_id: 2,
    item_id: 11,
    asked_on: '2026-07-07',
    concept: 'B',
    question: 'qb',
    answer: 'ab',
  },
];

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

describe('usePendingReviews', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the fetched reviews', async () => {
    vi.mocked(learningApi.getPendingReviews).mockResolvedValue(reviews);
    const client = makeClient();

    const { result } = renderHook(() => usePendingReviews(), {
      wrapper: wrapperFor(client),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reviews).toEqual(reviews);
  });
});

describe('useGradeReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('optimistically removes the graded log from the pending cache', async () => {
    vi.mocked(learningApi.gradeReview).mockResolvedValue({
      log_id: 1,
      item_id: 10,
      result: 'good',
      stage: 1,
      due_on: '2026-07-14',
      retired: false,
    });
    const client = makeClient();
    client.setQueryData(PENDING_KEY, reviews);

    const { result } = renderHook(() => useGradeReview(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.grade({ logId: 1, result: 'good' });
    });

    await waitFor(() => expect(learningApi.gradeReview).toHaveBeenCalled());
    const cache = client.getQueryData<PendingReview[]>(PENDING_KEY);
    expect(cache?.map((r) => r.log_id)).toEqual([2]);
  });

  it('keeps the log removed on a 409 (already graded)', async () => {
    vi.mocked(learningApi.gradeReview).mockRejectedValue(new ApiError('Already graded', 409));
    const client = makeClient();
    client.setQueryData(PENDING_KEY, reviews);

    const { result } = renderHook(() => useGradeReview(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.grade({ logId: 1, result: 'forgot' });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    const cache = client.getQueryData<PendingReview[]>(PENDING_KEY);
    expect(cache?.map((r) => r.log_id)).toEqual([2]);
  });

  it('rolls the cache back on a non-409 error', async () => {
    vi.mocked(learningApi.gradeReview).mockRejectedValue(new ApiError('Server error', 500));
    const client = makeClient();
    client.setQueryData(PENDING_KEY, reviews);

    const { result } = renderHook(() => useGradeReview(), {
      wrapper: wrapperFor(client),
    });

    act(() => {
      result.current.grade({ logId: 1, result: 'good' });
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    const cache = client.getQueryData<PendingReview[]>(PENDING_KEY);
    expect(cache?.map((r) => r.log_id)).toEqual([1, 2]);
  });
});
