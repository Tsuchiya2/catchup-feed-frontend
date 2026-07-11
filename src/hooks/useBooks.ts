/**
 * Book PDF management hooks (D-25)
 *
 * React Query hooks for the /books page: list, upload, delete.
 *
 * Cache design:
 * - ['books'] - the managed book list (single flat list, no params)
 *
 * Mutations simply invalidate the list — no optimistic updates. Uploads are
 * slow (up to 100MB over the tunnel) and the row's status comes from the
 * backend job state, so refetching after the fact is the honest UI.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBooks, uploadBook, deleteBook } from '@/lib/api/endpoints/books';
import type { PdfBook, UploadBookInput } from '@/types/api';

const BOOKS_KEY = ['books'] as const;

/**
 * Fetch the managed book list (uploads + CLI ingests) with ingest status.
 */
export function useBooks(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: BOOKS_KEY,
    queryFn: getBooks,
    staleTime: 30000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });

  return {
    books: (query.data ?? []) as PdfBook[],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: () => {
      query.refetch();
    },
  };
}

/**
 * Upload a book PDF. On success the list is refetched so the new entry
 * appears with its `pending` status (ingest runs on the Mac nightly batch).
 */
export function useUploadBook() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: UploadBookInput) => uploadBook(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEY });
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
 * Delete an uploaded book (row + PDF + pending job). Irreversible — the
 * caller must confirm first.
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (filename: string) => deleteBook(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKS_KEY });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
  };
}

export type { PdfBook, UploadBookInput };
