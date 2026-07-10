/**
 * Learning (spaced repetition) constants
 *
 * Shared labels and test IDs for the grading page, tracker, and book
 * management. Grading is the primary mobile flow (細切れ時間に片手で),
 * so labels stay short and the three results map to ○ △ ×.
 */

import type { GradeResult } from '@/types/api';

/**
 * Grade options in display order (good → fuzzy → forgot), with the
 * symbol/label shown on the big grading buttons.
 */
export const GRADE_OPTIONS: ReadonlyArray<{
  result: GradeResult;
  symbol: string;
  label: string;
}> = [
  { result: 'good', symbol: '○', label: 'わかった' },
  { result: 'fuzzy', symbol: '△', label: 'あいまい' },
  { result: 'forgot', symbol: '×', label: '忘れた' },
] as const;

/**
 * book_review status labels for the book management screen.
 */
export const BOOK_STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  active: 'In progress',
  finished: 'Finished',
};

/**
 * Test IDs for learning-related components.
 */
export const LEARNING_TEST_IDS = {
  /** The grading review card container */
  REVIEW_CARD: 'review-card',
  /** Tappable question area that reveals the answer */
  REVEAL_BUTTON: 'review-reveal-button',
  /** Revealed answer block */
  ANSWER: 'review-answer',
  /** Grade button prefix (suffixed with the result: -good/-fuzzy/-forgot) */
  GRADE_BUTTON: 'review-grade-button',
  /** Empty state shown when nothing is pending */
  EMPTY: 'review-empty',
  /** A tracker item row/card */
  ITEM: 'learning-item',
  /** Manual retire button on a tracker item */
  RETIRE_BUTTON: 'learning-item-retire-button',
  /** A book row/card in the book manager */
  BOOK: 'learning-book',
  /** Activate / deactivate toggle on a book */
  BOOK_TOGGLE: 'learning-book-toggle',
} as const;
