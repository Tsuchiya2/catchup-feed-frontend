/**
 * DeleteBookDialog Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteBookDialog } from './DeleteBookDialog';
import { BOOK_TEST_IDS } from '@/constants/book';
import * as useBooksModule from '@/hooks/useBooks';
import type { PdfBook } from '@/types/api';

// Mock the books hooks
vi.mock('@/hooks/useBooks', () => ({
  useDeleteBook: vi.fn(),
}));

const book: PdfBook = {
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

describe('DeleteBookDialog', () => {
  const defaultProps = {
    book,
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  const mockMutateAsync = vi.fn();
  const mockReset = vi.fn();

  const mockHook = (overrides: Partial<ReturnType<typeof useBooksModule.useDeleteBook>> = {}) => {
    vi.mocked(useBooksModule.useDeleteBook).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      reset: mockReset,
      ...overrides,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHook();
  });

  it('shows the book title and the irreversibility warning', () => {
    render(<DeleteBookDialog {...defaultProps} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.DELETE_DIALOG)).toBeInTheDocument();
    expect(screen.getByText(/実用 Go 言語/)).toBeInTheDocument();
    expect(screen.getByText(/この操作は取り消せません/)).toBeInTheDocument();
  });

  it('deletes by filename and closes on success', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue(undefined);
    render(<DeleteBookDialog {...defaultProps} />);

    await user.click(screen.getByTestId(BOOK_TEST_IDS.DELETE_CONFIRM_BUTTON));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('golang-book.pdf');
    });
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows the mutation error and stays open on failure', async () => {
    mockHook({ error: new Error('削除に失敗しました') });
    render(<DeleteBookDialog {...defaultProps} />);

    expect(screen.getByRole('alert')).toHaveTextContent('削除に失敗しました');
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('does not close while the delete is in flight (Escape / cancel guarded)', async () => {
    const user = userEvent.setup();
    mockHook({ isPending: true });
    render(<DeleteBookDialog {...defaultProps} />);

    // Escape key goes through Dialog's onOpenChange -> handleClose.
    await user.keyboard('{Escape}');
    // The cancel button is disabled, but clicking it must also be a no-op.
    await user.click(screen.getByTestId(BOOK_TEST_IDS.DELETE_CANCEL_BUTTON));

    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('closes normally via cancel when idle', async () => {
    const user = userEvent.setup();
    render(<DeleteBookDialog {...defaultProps} />);

    await user.click(screen.getByTestId(BOOK_TEST_IDS.DELETE_CANCEL_BUTTON));

    expect(mockReset).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
