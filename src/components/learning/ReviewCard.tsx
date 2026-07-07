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

const GRADE_BUTTON_STYLES: Record<GradeResult, string> = {
  good: 'border-[#00ffff]/50 bg-[#a0ffff]/10 text-[#a0ffff] hover:bg-[#a0ffff]/20 hover:shadow-[0_0_12px_#00ffff60]',
  fuzzy: 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-glow-sm',
  forgot: 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground',
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
      aria-label={`Review: ${review.concept}`}
    >
      <CardContent className="flex flex-col gap-5 p-6">
        {/* Concept heading */}
        <div className="flex items-center gap-2">
          <Badge variant="outline">Review</Badge>
          <span className="min-w-0 truncate text-sm font-medium text-muted-foreground">
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
            'rounded-lg border border-border/60 bg-background/40 p-4 text-left transition-colors',
            !revealed && 'cursor-pointer hover:border-primary/40 hover:bg-accent/40',
            revealed && 'cursor-default'
          )}
        >
          <p className="text-lg leading-relaxed text-foreground">{review.question}</p>
          {!revealed && (
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
              タップで答えを表示
            </p>
          )}
        </button>

        {/* Answer */}
        {revealed && (
          <div
            data-testid={LEARNING_TEST_IDS.ANSWER}
            className="rounded-lg border border-primary/20 bg-primary/5 p-4"
          >
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
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
                  'flex flex-col items-center justify-center gap-1 rounded-lg border py-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  GRADE_BUTTON_STYLES[result]
                )}
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {symbol}
                </span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
