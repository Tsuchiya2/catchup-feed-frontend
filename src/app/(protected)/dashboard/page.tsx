'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useArticles } from '@/hooks/useArticles';
import { useSources } from '@/hooks/useSources';
import { useAccessLogSummary } from '@/hooks/useAccessLogs';
import { useAuth } from '@/hooks/useAuth';
import { ConsoleClock } from '@/components/console/ConsoleClock';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
import type { SourceKind } from '@/types/api';

/**
 * Dashboard (概況) — 放送卓(改訂版) §3
 *
 * Is there enough material for tomorrow's episode, and are the friends still
 * listening? Only the panels backed by a real API are rendered: 明朝の候補
 * (latest crawled articles) and 受信状況 (per-friend last access, C-8). The
 * episode / batch / retention panels were removed rather than kept as hairline
 * frames full of `—` — no fabricated values, and no frames that never fill in.
 * The metric tiles keep `—` for the fields whose API is still pending.
 */

const KIND_LABELS: Record<SourceKind, string> = {
  rss: 'RSS',
  youtube: 'YT',
  podcast: 'POD',
  newsletter: 'NEWS',
};

/** Days without access before a friend counts as neglected (C-8: ~3 weeks). */
const NEGLECT_THRESHOLD_DAYS = 21;

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] tracking-[.2em] text-console-ink-weak">{children}</h2>
  );
}

function MetricTile({
  label,
  value,
  accent = false,
  className,
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('border-console-line-1 p-4', className)}>
      <p className="font-mono text-[11px] tracking-[.18em] text-console-ink-weak">{label}</p>
      <p
        className={cn(
          'mt-2 font-mono text-[28px] leading-none',
          accent ? 'text-console-cyan' : 'text-console-ink'
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const {
    articles,
    pagination,
    isLoading: articlesLoading,
    error: articlesError,
  } = useArticles({ limit: 3 });
  const { sources } = useSources();
  const { summary, isLoading: summaryLoading, error: summaryError } = useAccessLogSummary();

  const kindBySourceId = React.useMemo(() => {
    const map = new Map<number, SourceKind>();
    for (const source of sources) {
      map.set(source.id, source.kind ?? 'rss');
    }
    return map;
  }, [sources]);

  const totalArticles = articlesLoading ? '—' : String(pagination.total);

  return (
    <div className="flex flex-1 flex-col">
      {/* Status band — clock + logout only; episode state has no backend API */}
      <div className="flex h-[58px] shrink-0 items-center justify-end border-b border-console-line-2 bg-console-band px-5 sm:px-8">
        <div className="hidden items-center gap-4 desk:flex">
          <ConsoleClock className="text-[11.5px] text-console-ink-weak" />
          <button
            type="button"
            onClick={logout}
            className="flex min-h-[36px] items-center border border-console-line-3 px-3.5 text-[12px] text-console-ink-sub transition-colors duration-[120ms] ease-out hover:bg-console-hover"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 max-sm:p-5 sm:max-desk:p-7 desk:py-7 desk:pl-8 desk:pr-8">
        {/* Metric tiles (< 900px only; README responsive spec) */}
        <div className="grid grid-cols-2 border border-console-line-2 bg-console-panel sm:grid-cols-4 desk:hidden">
          <MetricTile label="EPISODE" value="—" className="hidden sm:block" />
          <MetricTile label="尺" value="—" className="hidden sm:block sm:border-l" />
          <MetricTile label="記事" value={totalArticles} className="sm:border-l" />
          <MetricTile label="要約待ち" value="—" accent className="border-l" />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-[26px] sm:max-desk:grid-cols-[1.4fr_1fr] desk:grid-cols-[1.55fr_1fr]">
          {/* Left column */}
          <div className="flex min-w-0 flex-col gap-5">
            {/* 明朝の候補 — latest crawled articles */}
            <section>
              <header className="flex items-center justify-between pb-2">
                <PanelHeading>明朝の候補</PanelHeading>
                <Link
                  href="/articles"
                  className="font-mono text-[11px] text-console-cyan hover:underline"
                >
                  {articlesLoading ? '—' : pagination.total} 件すべて見る
                </Link>
              </header>
              {articlesError && (
                <p className="border-t border-console-line-2 py-3 font-mono text-[11px] text-console-warn">
                  記事の取得に失敗しました
                </p>
              )}
              {!articlesError &&
                (articlesLoading || articles.length === 0
                  ? [0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 border-t border-console-line-2 py-3.5"
                      >
                        <span className="w-[72px] shrink-0 font-mono text-[11.5px] text-console-ink-faint">
                          —
                        </span>
                        <span className="min-h-[20px] flex-1" />
                      </div>
                    ))
                  : articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center gap-4 border-t border-console-line-2 py-3.5"
                      >
                        <span className="w-[72px] shrink-0 font-mono text-[11.5px] text-console-ink-faint">
                          {formatRelativeTimeJa(article.published_at)}
                        </span>
                        <Link
                          href={`/articles/${article.id}`}
                          className="min-w-0 flex-1 truncate text-[13.5px] text-console-ink hover:underline"
                        >
                          {article.title}
                        </Link>
                        <span className="shrink-0 font-mono text-[10.5px] text-console-ink-faint">
                          {KIND_LABELS[kindBySourceId.get(article.source_id) ?? 'rss']}
                        </span>
                      </div>
                    )))}
            </section>
          </div>

          {/* Right column */}
          <div className="flex min-w-0 flex-col gap-[18px]">
            {/* 受信状況 — per-friend last access (real data) */}
            <section className="border border-console-line-2 bg-console-panel px-[18px] py-4">
              <PanelHeading>受信状況</PanelHeading>
              {summaryError && (
                <p className="mt-3 font-mono text-[11px] text-console-warn">
                  受信状況の取得に失敗しました
                </p>
              )}
              {!summaryError && (
                <div className="mt-2 flex flex-col">
                  {summaryLoading || summary.length === 0 ? (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="min-h-[20px] flex-1" />
                      <span className="font-mono text-[11px] text-console-ink-faint">—</span>
                    </div>
                  ) : (
                    summary.map((row) => {
                      const neglected =
                        row.days_since_last_access === null ||
                        row.days_since_last_access >= NEGLECT_THRESHOLD_DAYS;
                      return (
                        <div
                          key={row.subscriber_id}
                          className="flex items-center justify-between gap-4 py-1.5"
                        >
                          <span className="truncate text-[13.5px] text-console-ink">
                            {row.subscriber_name}
                          </span>
                          <span
                            className={cn(
                              'shrink-0 font-mono text-[11px]',
                              neglected ? 'text-console-warn' : 'text-console-cyan'
                            )}
                          >
                            {formatRelativeTimeJa(row.last_accessed_at)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
