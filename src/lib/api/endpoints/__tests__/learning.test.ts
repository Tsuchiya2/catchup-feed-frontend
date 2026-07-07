import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPendingReviews,
  gradeReview,
  getLearningItems,
  retireLearningItem,
  getLearningBooks,
  activateBook,
  deactivateBook,
} from '../learning';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { PendingReview, LearningItem, LearningBook } from '@/types/api';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockReview: PendingReview = {
  log_id: 12,
  item_id: 3,
  asked_on: '2026-07-07',
  concept: 'goroutine リーク検出',
  question: 'goroutine リークはどう検出する?',
  answer: 'pprof の goroutine プロファイルで数の増加を見る。',
};

describe('Learning API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPendingReviews', () => {
    it('calls GET /learning/reviews/pending', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockReview]);

      const result = await getPendingReviews();

      expect(apiClient.get).toHaveBeenCalledWith('/learning/reviews/pending');
      expect(result).toEqual([mockReview]);
    });
  });

  describe('gradeReview', () => {
    it('POSTs the result to /learning/reviews/:id/grade', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ log_id: 12, result: 'good' });

      await gradeReview(12, 'good');

      expect(apiClient.post).toHaveBeenCalledWith('/learning/reviews/12/grade', {
        result: 'good',
      });
    });

    it('propagates a 409 (already graded)', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError('Already graded', 409));

      await expect(gradeReview(12, 'forgot')).rejects.toThrow('Already graded');
    });
  });

  describe('getLearningItems', () => {
    it('calls GET /learning/items without a status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      await getLearningItems();

      expect(apiClient.get).toHaveBeenCalledWith('/learning/items');
    });

    it('appends the status query param', async () => {
      const item: LearningItem = {
        id: 3,
        kind: 'article',
        article_id: 42,
        book_id: null,
        concept: 'goroutine リーク検出',
        question: 'q',
        answer: 'a',
        provider: 'gemini',
        stage: 1,
        due_on: '2026-07-14',
        retired_at: null,
        created_at: '2026-07-07T00:00:00Z',
        times_asked: 2,
        last_result: 'good',
        last_asked_on: '2026-07-07',
      };
      vi.mocked(apiClient.get).mockResolvedValue([item]);

      const result = await getLearningItems('retired');

      expect(apiClient.get).toHaveBeenCalledWith('/learning/items?status=retired');
      expect(result).toEqual([item]);
    });
  });

  describe('retireLearningItem', () => {
    it('POSTs to /learning/items/:id/retire', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ id: 3, retired_at: '2026-07-07T00:00:00Z' });

      await retireLearningItem(3);

      expect(apiClient.post).toHaveBeenCalledWith('/learning/items/3/retire');
    });
  });

  describe('books', () => {
    const mockBook: LearningBook = {
      id: 7,
      title: 'リーダブルコード',
      review_status: 'active',
      review_cursor: 12,
      total_chunks: 180,
    };

    it('getLearningBooks calls GET /learning/books', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockBook]);

      const result = await getLearningBooks();

      expect(apiClient.get).toHaveBeenCalledWith('/learning/books');
      expect(result).toEqual([mockBook]);
    });

    it('activateBook POSTs to /learning/books/:id/activate', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockBook);

      await activateBook(7);

      expect(apiClient.post).toHaveBeenCalledWith('/learning/books/7/activate');
    });

    it('deactivateBook POSTs to /learning/books/:id/deactivate', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ ...mockBook, review_status: 'idle' });

      await deactivateBook(7);

      expect(apiClient.post).toHaveBeenCalledWith('/learning/books/7/deactivate');
    });
  });
});
