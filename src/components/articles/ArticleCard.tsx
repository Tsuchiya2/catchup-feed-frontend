import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { truncateText } from '@/lib/utils/truncate';
import { normalizeSourceName } from '@/utils/article';
import type { Article } from '@/types/api';

interface ArticleCardProps {
  article: Article;
  sourceName?: string;
  className?: string;
}

/**
 * ArticleCard — one row of the console article list (放送卓改訂版).
 *
 * List form per design handoff: a 1px-framed panel holds hairline-divided
 * rows; each row is relative time (mono) / title + summary / source label
 * (mono). No card chrome, no shadows, hover moves the background one step.
 *
 * Links to the article detail page (/articles/[id]).
 * Memoized to prevent unnecessary re-renders in lists.
 */
export const ArticleCard = React.memo(function ArticleCard({
  article,
  sourceName,
  className,
}: ArticleCardProps) {
  // Safe field access with fallbacks
  const title = article.title?.trim() || '(無題)';
  const summary = article.summary?.trim() || '';
  const publishedDate = article.published_at;
  const displaySourceName = normalizeSourceName(sourceName ?? article.source_name);

  return (
    <Link
      href={`/articles/${article.id}`}
      className={cn(
        'flex items-center gap-4 border-b border-console-line-1 px-[18px] py-3.5 transition-colors duration-[120ms] ease-out last:border-b-0 hover:bg-console-hover',
        'focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-console-cyan',
        className
      )}
      aria-label={`記事: ${title}`}
    >
      {publishedDate ? (
        <time
          dateTime={publishedDate}
          className="w-[72px] shrink-0 font-mono text-[11.5px] text-console-ink-faint"
        >
          {formatRelativeTimeJa(publishedDate)}
        </time>
      ) : (
        <span className="w-[72px] shrink-0 font-mono text-[11.5px] text-console-ink-ghost">—</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] text-console-ink">{title}</span>
        {summary && (
          <span className="mt-0.5 block truncate text-[12px] text-console-ink-weak">
            {truncateText(summary, 150)}
          </span>
        )}
      </span>
      <span className="hidden max-w-[160px] shrink-0 truncate font-mono text-[10.5px] text-console-ink-faint sm:block">
        {displaySourceName}
      </span>
    </Link>
  );
});
