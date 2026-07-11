import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BookCard } from './BookCard';
import type { PdfBook } from '@/types/api';

/**
 * BookCard (book PDF management, D-25)
 *
 * One managed book on the /books page: title, file metadata, ingest status
 * badge (待機 / 処理中 / 完了 / 失敗), and a delete button for Pi uploads.
 * CLI-ingested books are read-only here.
 */
const meta = {
  title: 'Books/BookCard',
  component: BookCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BookCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const base: PdfBook = {
  filename: 'golang-book.pdf',
  title: '実用 Go 言語',
  file_path: '/data/books/golang-book.pdf',
  deletable: true,
  size_bytes: 24 * 1024 * 1024,
  uploaded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  status: 'pending',
  book_id: null,
  chunk_count: null,
};

/**
 * Freshly uploaded — waiting for the Mac nightly batch (03:00).
 */
export const Pending: Story = {
  args: {
    book: base,
    onDelete: () => {},
  },
};

/**
 * The Mac worker is ingesting right now.
 */
export const Processing: Story = {
  args: {
    book: { ...base, status: 'processing' },
    onDelete: () => {},
  },
};

/**
 * Ingest finished — chunk count available.
 */
export const Done: Story = {
  args: {
    book: { ...base, status: 'done', book_id: 5, chunk_count: 412 },
    onDelete: () => {},
  },
};

/**
 * Ingest failed — re-upload retries it.
 */
export const Failed: Story = {
  args: {
    book: { ...base, status: 'failed' },
    onDelete: () => {},
  },
};

/**
 * CLI-ingested book: no delete button, no file metadata on the Pi.
 */
export const CliIngested: Story = {
  args: {
    book: {
      filename: 'readable-code.pdf',
      title: 'リーダブルコード',
      file_path: '/Users/yuji/books/readable-code.pdf',
      deletable: false,
      size_bytes: null,
      uploaded_at: null,
      status: 'done',
      book_id: 3,
      chunk_count: 180,
    },
    onDelete: () => {},
  },
};
