'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useArticle } from '@/hooks/useArticle';
import { ConsolePlayer } from '@/components/console/ConsolePlayer';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import { safeExternalHref } from '@/lib/utils/safeExternalHref';

/**
 * Article Detail — 放送卓(改訂版) §4
 *
 * One article's summary, where it airs in the episode, and when it will be
 * re-asked. Episode / segment / script / quiz data has no backend API yet:
 * those regions render hairline frames with `—` (README ローディング spec).
 * The player is fully implemented but has no audio source until the episode
 * API lands, so it renders in its degraded state.
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
      {/* Status band: breadcrumb + prev/next (episode linkage API pending) */}
      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-console-line-2 bg-console-band px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[11.5px]">
          <Link
            href="/articles"
            className="shrink-0 text-console-ink-weak transition-colors duration-[120ms] ease-out hover:text-console-ink hover:underline"
          >
            <span className="sm:hidden">← 記事</span>
            <span className="hidden sm:inline">記事</span>
          </Link>
          <span aria-hidden className="text-console-ink-faint">
            ／
          </span>
          <span className="truncate text-console-cyan">—</span>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            disabled
            title="番組 API 未接続のため使用できません"
            className="border border-console-line-3 px-3 py-1.5 font-mono text-[11px] text-console-ink-weak disabled:opacity-60"
          >
            ← 前の記事
          </button>
          <button
            type="button"
            disabled
            title="番組 API 未接続のため使用できません"
            className="border border-console-line-3 px-3 py-1.5 font-mono text-[11px] text-console-ink-weak disabled:opacity-60"
          >
            次の記事 →
          </button>
        </div>
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

      {!error && (isLoading || article) && (
        <div className="flex flex-1 flex-col desk:grid desk:grid-cols-[1fr_300px]">
          {/* Main column */}
          <article className="flex min-w-0 flex-col gap-5 max-sm:p-5 sm:max-desk:p-8 desk:border-r desk:border-console-line-2 desk:pb-8 desk:pl-9 desk:pr-10 desk:pt-10">
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

            {/* Player — no episode audio API yet, renders degraded */}
            <ConsolePlayer storageKey={`article-${articleId}`} />

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

          {/* Sidebar — script / quiz / same-episode APIs pending */}
          <aside className="flex flex-col gap-6 border-t border-console-line-2 bg-console-panel max-sm:p-5 sm:max-desk:p-8 desk:border-t-0 desk:px-7 desk:py-10">
            <section className="flex flex-col gap-3">
              <SectionLabel>読み上げ台本</SectionLabel>
              <p className="font-mono text-[12px] text-console-ink-faint">—</p>
            </section>

            <div aria-hidden className="h-px bg-console-line-2" />

            <section className="flex flex-col gap-3">
              <SectionLabel>出題</SectionLabel>
              <p className="text-[13.5px] leading-[1.9] text-console-ink-sub">—</p>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} aria-hidden className="h-[5px] w-6 bg-console-line-3" />
                ))}
                <span className="ml-2 font-mono text-[11.5px] text-console-ink-faint">— / —</span>
              </div>
              <p className="font-mono text-[11.5px] text-console-violet">— 再出題</p>
            </section>

            <div aria-hidden className="h-px bg-console-line-2" />

            <section className="flex flex-col gap-3">
              <SectionLabel>同じ回</SectionLabel>
              <p className="font-mono text-[12px] text-console-ink-faint">—</p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
