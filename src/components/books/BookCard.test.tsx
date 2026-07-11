import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookCard } from './BookCard';
import { BOOK_TEST_IDS } from '@/constants/book';
import type { PdfBook } from '@/types/api';

const uploaded: PdfBook = {
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

const cliIngested: PdfBook = {
  filename: 'readable-code.pdf',
  title: 'リーダブルコード',
  file_path: '/Users/yuji/books/readable-code.pdf',
  deletable: false,
  size_bytes: null,
  uploaded_at: null,
  status: 'done',
  book_id: 3,
  chunk_count: 412,
};

describe('BookCard (book PDF management)', () => {
  it('shows title, filename, and size', () => {
    render(<BookCard book={uploaded} onDelete={vi.fn()} />);

    expect(screen.getByText('実用 Go 言語')).toBeInTheDocument();
    expect(screen.getByText('golang-book.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('shows the pending status badge with the nightly-batch note', () => {
    render(<BookCard book={uploaded} onDelete={vi.fn()} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.STATUS_BADGE)).toHaveTextContent('待機');
    expect(screen.getByText(/Mac の夜間バッチで実行/)).toBeInTheDocument();
  });

  it('offers delete for a deletable (uploaded) book', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<BookCard book={uploaded} onDelete={onDelete} />);

    await user.click(screen.getByTestId(BOOK_TEST_IDS.DELETE_BUTTON));
    expect(onDelete).toHaveBeenCalledWith(uploaded);
  });

  it('shows a CLI badge instead of a delete button for CLI-ingested books', () => {
    render(<BookCard book={cliIngested} onDelete={vi.fn()} />);

    expect(screen.getByText('CLI 取り込み')).toBeInTheDocument();
    expect(screen.queryByTestId(BOOK_TEST_IDS.DELETE_BUTTON)).not.toBeInTheDocument();
    // CLI books have no file on the Pi: size / upload time render as "-"
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('shows chunk count and done status for an ingested book', () => {
    render(<BookCard book={cliIngested} onDelete={vi.fn()} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.STATUS_BADGE)).toHaveTextContent('完了');
    expect(screen.getByText('412')).toBeInTheDocument();
  });

  it('shows the failed status with a re-upload hint', () => {
    render(<BookCard book={{ ...uploaded, status: 'failed' }} onDelete={vi.fn()} />);

    expect(screen.getByTestId(BOOK_TEST_IDS.STATUS_BADGE)).toHaveTextContent('失敗');
    expect(screen.getByText(/再アップロードで再試行/)).toBeInTheDocument();
  });
});
