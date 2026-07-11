/**
 * UploadBookDialog Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadBookDialog } from './UploadBookDialog';
import { BOOK_TEST_IDS, BOOK_MAX_UPLOAD_BYTES } from '@/constants/book';
import { ApiError } from '@/lib/api/errors';
import * as useBooksModule from '@/hooks/useBooks';

// Mock the books hooks
vi.mock('@/hooks/useBooks', () => ({
  useUploadBook: vi.fn(),
}));

function makePdf(name: string, size: number): File {
  const file = new File(['%PDF-1.7'], name, { type: 'application/pdf' });
  // File size is derived from content; override for the limit tests.
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('UploadBookDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  const mockMutateAsync = vi.fn();
  const mockReset = vi.fn();

  const mockHook = (overrides: Partial<ReturnType<typeof useBooksModule.useUploadBook>> = {}) => {
    vi.mocked(useBooksModule.useUploadBook).mockReturnValue({
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

  it('renders file and title inputs with the nightly-batch / replace note', () => {
    render(<UploadBookDialog {...defaultProps} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_FILE_INPUT)).toHaveAttribute(
      'accept',
      '.pdf,application/pdf'
    );
    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_TITLE_INPUT)).toBeInTheDocument();
    expect(screen.getByText(/Mac の夜間バッチ.*で実行されます/)).toBeInTheDocument();
    expect(screen.getByText(/同名ファイルの再アップロードは置き換え/)).toBeInTheDocument();
  });

  it('disables submit until a file is selected', () => {
    render(<UploadBookDialog {...defaultProps} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_SUBMIT_BUTTON)).toBeDisabled();
  });

  it('rejects a file over 100MB client-side without calling the API', async () => {
    const user = userEvent.setup();
    render(<UploadBookDialog {...defaultProps} />);

    const tooBig = makePdf('big.pdf', BOOK_MAX_UPLOAD_BYTES + 1);
    await user.upload(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_FILE_INPUT), tooBig);

    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_ERROR)).toHaveTextContent(/100MB/);
    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_SUBMIT_BUTTON)).toBeDisabled();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('uploads the selected file with the entered title and closes on success', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});
    render(<UploadBookDialog {...defaultProps} />);

    const file = makePdf('golang-book.pdf', 1024);
    await user.upload(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_FILE_INPUT), file);
    await user.type(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_TITLE_INPUT), '実用 Go 言語');
    await user.click(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ file, title: '実用 Go 言語' });
    });
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('sends title as undefined when left empty', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({});
    render(<UploadBookDialog {...defaultProps} />);

    const file = makePdf('golang-book.pdf', 1024);
    await user.upload(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_FILE_INPUT), file);
    await user.click(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_SUBMIT_BUTTON));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ file, title: undefined });
    });
  });

  it('shows a friendly message for a 413 response', () => {
    mockHook({ error: new ApiError('Payload Too Large', 413) });
    render(<UploadBookDialog {...defaultProps} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_ERROR)).toHaveTextContent(
      /上限.100MB.を超えています/
    );
  });

  it('shows the backend message for a 400 validation error', () => {
    mockHook({ error: new ApiError('not a PDF', 400) });
    render(<UploadBookDialog {...defaultProps} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.UPLOAD_ERROR)).toHaveTextContent(/not a PDF/);
  });

  it('shows the progress indicator and blocks closing while uploading', async () => {
    const user = userEvent.setup();
    mockHook({ isPending: true });
    render(<UploadBookDialog {...defaultProps} />);

    expect(screen.getByRole('status')).toHaveTextContent(/アップロード中/);
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
