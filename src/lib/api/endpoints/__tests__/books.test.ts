import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBooks, uploadBook, deleteBook } from '../books';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { PdfBook } from '@/types/api';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBook: PdfBook = {
  filename: 'golang-book.pdf',
  title: '実用 Go 言語',
  file_path: '/data/books/golang-book.pdf',
  deletable: true,
  size_bytes: 1048576,
  uploaded_at: '2026-07-11T10:00:00Z',
  status: 'pending',
  book_id: null,
  chunk_count: null,
};

describe('Books API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBooks', () => {
    it('calls GET /books', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([mockBook]);

      const result = await getBooks();

      expect(apiClient.get).toHaveBeenCalledWith('/books');
      expect(result).toEqual([mockBook]);
    });

    it('propagates API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError('Server Error', 500));

      await expect(getBooks()).rejects.toThrow('Server Error');
    });
  });

  describe('uploadBook', () => {
    it('calls POST /books with multipart FormData (file + title)', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockBook);

      const file = new File(['%PDF-1.7'], 'golang-book.pdf', { type: 'application/pdf' });
      const result = await uploadBook({ file, title: '実用 Go 言語' });

      // The 10-minute timeout is load-bearing: with the default 30s a
      // 100MB upload over the tunnel would be aborted mid-flight.
      expect(apiClient.post).toHaveBeenCalledWith(
        '/books',
        expect.any(FormData),
        expect.objectContaining({ retry: false, timeout: 600000 })
      );
      const call = vi.mocked(apiClient.post).mock.lastCall;
      if (!call) {
        throw new Error('apiClient.post was not called');
      }
      const formData = call[1] as FormData;
      expect(formData.get('file')).toBe(file);
      expect(formData.get('title')).toBe('実用 Go 言語');
      expect(result).toEqual(mockBook);
    });

    it('omits the title field when not provided', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockBook);

      const file = new File(['%PDF-1.7'], 'golang-book.pdf', { type: 'application/pdf' });
      await uploadBook({ file });

      const call = vi.mocked(apiClient.post).mock.lastCall;
      if (!call) {
        throw new Error('apiClient.post was not called');
      }
      const formData = call[1] as FormData;
      expect(formData.get('title')).toBeNull();
    });

    it('propagates a 413 (over 100MB) error', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new ApiError('Payload Too Large', 413));

      const file = new File(['%PDF-1.7'], 'big.pdf', { type: 'application/pdf' });
      await expect(uploadBook({ file })).rejects.toMatchObject({ status: 413 });
    });
  });

  describe('deleteBook', () => {
    it('calls DELETE /books/:filename URL-encoded, with retries disabled', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await deleteBook('go 実践入門.pdf');

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/books/${encodeURIComponent('go 実践入門.pdf')}`,
        expect.objectContaining({ retry: false })
      );
    });

    it('treats a 404 as success (book already gone)', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new ApiError('Not Found', 404));

      await expect(deleteBook('missing.pdf')).resolves.toBeUndefined();
    });

    it('propagates non-404 errors', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new ApiError('Server Error', 500));

      await expect(deleteBook('golang-book.pdf')).rejects.toMatchObject({ status: 500 });
    });
  });
});
