/**
 * ReviewCard Component
 *
 * A single review shown on the grading page: concept + question, tap to
 * reveal the answer, then grade with the big ○ △ × buttons. Built for the
 * phone: one card at a time, large touch targets, thumb-reachable actions.
 *
 * No progress counter, no "N remaining" badge — grading is a quiet,
 * frictionless flow, never a backlog to clear (§2 Out, §8.2 禁止事項).
 */
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GRADE_OPTIONS, LEARNING_TEST_IDS } from '@/constants/learning';
import type { PendingReview, GradeResult } from '@/types/api';

interface ReviewCardProps {
  /** The pending review to display */
  review: PendingReview;
  /** Called with the chosen result when a grade button is tapped */
  onGrade: (result: GradeResult) => void;
}

/* 復習はバイオレット系統(README 原則5)。塗りは使わず 1px 枠のみ。 */
const GRADE_BUTTON_STYLES: Record<GradeResult, string> = {
  good: 'border-console-violet text-console-violet hover:bg-console-hover',
  fuzzy: 'border-console-line-3 text-console-ink-sub hover:bg-console-hover',
  forgot:
    'border-console-line-2 text-console-ink-faint hover:bg-console-hover hover:text-console-ink-sub',
};

/**
 * ReviewCard — question first, answer on tap, grade to advance.
 *
 * The reveal state is keyed by the card's log_id via `key` at the call
 * site, so each new card starts hidden.
 */
export function ReviewCard({ review, onGrade }: ReviewCardProps) {
  const [revealed, setRevealed] = React.useState(false);

  return (
    <Card
      className="mx-auto w-full max-w-xl"
      data-testid={LEARNING_TEST_IDS.REVIEW_CARD}
      aria-label={`復習: ${review.concept}`}
    >
      <CardContent className="flex flex-col gap-5 p-6">
        {/* Concept heading */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">復習</Badge>
          <span className="min-w-0 truncate text-[13px] text-console-ink-weak">
            {review.concept}
          </span>
        </div>

        {/* Question — tap anywhere to reveal the answer */}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={revealed}
          data-testid={LEARNING_TEST_IDS.REVEAL_BUTTON}
          aria-expanded={revealed}
          className={cn(
            'border border-console-line-2 bg-console-bg p-4 text-left transition-colors duration-[120ms] ease-out',
            !revealed && 'cursor-pointer hover:bg-console-hover',
            revealed && 'cursor-default'
          )}
        >
          <p className="text-[15px] leading-[2.1] text-console-ink [text-wrap:pretty]">
            {review.question}
          </p>
          {!revealed && (
            <p className="mt-3 font-mono text-[10.5px] tracking-[.18em] text-console-ink-faint">
              タップで答えを表示
            </p>
          )}
        </button>

        {/* Answer */}
        {revealed && (
          <div data-testid={LEARNING_TEST_IDS.ANSWER} className="border border-console-violet p-4">
            <p className="whitespace-pre-line text-[14px] leading-[2] text-console-ink [text-wrap:pretty]">
              {review.answer}
            </p>
          </div>
        )}

        {/* Grade buttons — only after the answer is shown */}
        {revealed && (
          <div className="grid grid-cols-3 gap-3">
            {GRADE_OPTIONS.map(({ result, symbol, label }) => (
              <button
                key={result}
                type="button"
                onClick={() => onGrade(result)}
                data-testid={`${LEARNING_TEST_IDS.GRADE_BUTTON}-${result}`}
                aria-label={label}
                className={cn(
                  'flex min-h-[44px] flex-col items-center justify-center gap-1 border py-4 transition-colors duration-[120ms] ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan',
                  GRADE_BUTTON_STYLES[result]
                )}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {symbol}
                </span>
                <span className="text-[11.5px]">{label}</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
