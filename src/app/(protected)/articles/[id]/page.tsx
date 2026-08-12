'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useArticle } from '@/hooks/useArticle';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { safeExternalHref } from '@/lib/utils/safeExternalHref';

/**
 * Article Detail — 放送卓(改訂版) §4
 *
 * One article's title, source and AI summary, as a single reading column.
 * The design's right sidebar (読み上げ台本 / 出題 / 同じ回), the status band's
 * `← 前の記事` / `次の記事 →`, and the breadcrumb's episode slot are
 * permanently removed (D-38). Each region had its own reason:
 *
 * - 読み上げ台本 / 同じ回 / breadcrumb episode slot ("EP 218 に収録済"): no API
 *   links an article to an episode or its segments (the generated types expose
 *   no `/episodes` path), and adding a backend endpoint just for this screen is
 *   not right-sized. The breadcrumb is now the 記事 link alone.
 * - 前後記事: no adjacency API. Faking it with the list's pagination endpoint
 *   would drag the list's filter and sort state into this page — complexity
 *   out of proportion to the value.
 * - 出題: this one was implementable — `GET /learning/items` already returns
 *   `article_id` / `question` / `stage` / `due_on`. It was dropped by product
 *   decision, not for lack of an API: quizzes belong to `/learning`, and this
 *   page stays a place to read the summary.
 *
 * One placeholder is left on purpose: `本文抽出 —` in the footer. The article
 * DTO carries no extracted-body length, but the rest of that line is live data
 * (要約字数 / 取得時刻), so the line stays whole with one field degraded rather
 * than being dropped (D-38).
 *
 * No audio player here (D-35): per-article audio files are never generated,
 * and episode audio is delivered by the podcast app, not this dashboard.
 */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] tracking-[.2em] text-console-ink-faint">{children}</h2>
  );
}

function formatClockTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id || '0', 10);

  const { article, isLoading, error, refetch } = useArticle(articleId);

  const originalHref = safeExternalHref(article?.url);
  const summaryParagraphs = (article?.summary ?? '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-1 flex-col">
      {/* Status band (58px): breadcrumb only. README §4 was revised with D-38
          to put nothing on the right — this matches the design, not a drift. */}
      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-console-line-2 bg-console-band px-5 sm:px-8">
        <Link
          href="/articles"
          className="flex h-full min-w-[44px] items-center font-mono text-[11.5px] text-console-ink-weak transition-colors duration-[120ms] ease-out hover:text-console-ink hover:underline"
        >
          <span className="sm:hidden">← 記事</span>
          <span className="hidden sm:inline">記事</span>
        </Link>
      </div>

      {/* Error / not-found states, kept quiet (縮退許容 — no alarm red) */}
      {error && (
        <div className="flex flex-col items-start gap-4 p-5 sm:p-8">
          <p className="font-mono text-[12px] text-console-warn">記事の取得に失敗しました</p>
          <button
            type="button"
            onClick={refetch}
            className="border border-console-line-3 px-3.5 py-2 text-[13px] text-console-ink-sub transition-colors duration-[120ms] ease-out hover:bg-console-hover"
          >
            再試行
          </button>
        </div>
      )}
      {!isLoading && !error && !article && (
        <div className="flex flex-col items-start gap-4 p-5 sm:p-8">
          <p className="font-mono text-[12px] text-console-ink-weak">記事が見つかりませんでした</p>
          <Link
            href="/articles"
            className="border border-console-line-3 px-3.5 py-2 text-[13px] text-console-ink-sub transition-colors duration-[120ms] ease-out hover:bg-console-hover"
          >
            記事一覧へ戻る
          </Link>
        </div>
      )}

      {/* Single reading column: capped at 720px so long summaries keep a
          readable measure, left-aligned on the status band's padding.
          `flex-1` is desk-only so the footer's `mt-auto` pins the stats line
          to the viewport bottom at >= 900px and leaves it directly under the
          summary below that (README §4 states the same width rule). */}
      {!error && (isLoading || article) && (
        <article className="flex min-w-0 max-w-[720px] flex-col gap-5 max-sm:p-5 sm:max-desk:p-8 desk:flex-1 desk:px-8 desk:pb-8 desk:pt-10">
          <h1 className="text-[22px] font-bold leading-[1.5] sm:text-[36px]">
            {article ? article.title : '—'}
          </h1>

          <div className="flex flex-wrap items-center gap-[18px] font-mono text-[11.5px]">
            <span className="border border-console-line-4 px-[9px] py-1 uppercase tracking-[.08em] text-console-cyan">
              {article ? article.source_name : '—'}
            </span>
            <span className="text-console-ink-weak">
              {formatRelativeTimeJa(article?.published_at)}
            </span>
            {originalHref && (
              <a
                href={originalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-console-ink-sub underline decoration-console-line-4 underline-offset-4 transition-colors duration-[120ms] ease-out hover:decoration-console-ink-sub"
              >
                原文
              </a>
            )}
          </div>

          <section className="flex flex-col gap-4">
            <SectionLabel>要約</SectionLabel>
            {summaryParagraphs.length > 0 ? (
              summaryParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-[2.1] text-console-ink-sub [text-wrap:pretty]"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="font-mono text-[12px] text-console-ink-faint">—</p>
            )}
          </section>

          <footer className="mt-auto border-t border-console-line-1 pt-3 font-mono text-[11px] text-console-ink-ghost">
            本文抽出 — ／ 要約 {article ? article.summary.length : '—'} 字 ／ 取得{' '}
            {formatClockTime(article?.crawled_at)}
          </footer>
        </article>
      )}
    </div>
  );
}
