'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useMe } from '@/hooks/useAuth';
import { usePendingReviews } from '@/hooks/useLearning';
import { ConsoleClock } from '@/components/console/ConsoleClock';
import type { UserRole } from '@/types/api';

/**
 * ConsoleShell — 放送卓(改訂版) shared chrome.
 *
 * - >= 900px (desk): 214px left rail with 卓/入力/送出 groups
 * - 640–899px: top bar + horizontal tab row (filled selection)
 * - < 640px: top bar + fixed bottom tab bar (4 tabs, 62px, tap >= 44px)
 *
 * Selection is shown by fill only (light: near-black, dark: cyan) — no
 * underlines, no badges (README Interactions & Behavior).
 */

interface RailItem {
  name: string;
  href: string;
}

interface RailGroup {
  label: string;
  items: RailItem[];
}

const ADMIN_GROUPS: RailGroup[] = [
  { label: '卓', items: [{ name: '概況', href: '/dashboard' }] },
  {
    label: '入力',
    items: [
      { name: '記事', href: '/articles' },
      { name: 'ソース', href: '/sources' },
      { name: '書籍', href: '/books' },
    ],
  },
  {
    label: '送出',
    items: [
      { name: '友人', href: '/subscribers' },
      { name: '視聴者', href: '/viewers' },
      { name: 'アクセスログ', href: '/access-logs' },
      { name: '復習', href: '/learning' },
    ],
  },
];

const VIEWER_GROUPS: RailGroup[] = [
  { label: '入力', items: [{ name: 'ソース', href: '/sources' }] },
];

function groupsForRole(role: UserRole | undefined): RailGroup[] {
  if (role === 'admin') return ADMIN_GROUPS;
  if (role === 'viewer') return VIEWER_GROUPS;
  return [];
}

function isActivePath(pathname: string | null, href: string): boolean {
  return pathname === href || Boolean(pathname?.startsWith(href + '/'));
}

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { role } = useMe();
  // Pending review count feeds the 復習 bottom-tab sublabel (admin only).
  const { reviews, isLoading: reviewsLoading } = usePendingReviews({
    enabled: role === 'admin',
  });

  const groups = groupsForRole(role);
  const flatItems = groups.flatMap((g) => g.items);

  // Bottom tabs (< 640px): 卓/入力/送出/復習. A tab lights up when the current
  // path belongs to any route in its group.
  const bottomTabs =
    role === 'viewer'
      ? [{ top: 'ソース', sub: 'RSS', href: '/sources', paths: ['/sources'] }]
      : [
          { top: '卓', sub: '概況', href: '/dashboard', paths: ['/dashboard'] },
          {
            top: '入力',
            sub: '記事',
            href: '/articles',
            paths: ['/articles', '/sources', '/books'],
          },
          {
            top: '送出',
            sub: '友人',
            href: '/subscribers',
            paths: ['/subscribers', '/viewers', '/access-logs'],
          },
          {
            top: '復習',
            sub: reviewsLoading ? '—' : `${reviews.length} 問`,
            href: '/learning',
            paths: ['/learning'],
          },
        ];

  return (
    <div className="flex min-h-screen bg-console-bg text-console-ink">
      {/* Left rail (>= 900px) */}
      <aside className="hidden w-[214px] shrink-0 flex-col border-r border-console-line-2 bg-console-rail px-[18px] py-[22px] desk:flex">
        <Link
          href={role === 'viewer' ? '/sources' : '/dashboard'}
          className="block px-3 pb-5 text-[15px] font-bold leading-[1.5] tracking-[.02em] text-console-ink"
        >
          Catchup
          <br />
          Feed
        </Link>
        <nav className="flex flex-col gap-1" aria-label="メインナビゲーション">
          {groups.map((group) => (
            <React.Fragment key={group.label}>
              <p className="px-3 pb-1.5 pt-4 font-mono text-[10.5px] tracking-[.2em] text-console-ink-faint">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex min-h-[44px] items-center px-3 text-[13.5px] transition-colors duration-[120ms] ease-out',
                      active
                        ? 'bg-console-sel-bg text-console-sel-ink'
                        : 'text-console-ink-sub hover:bg-console-hover'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>
        {/* Rail footer: host stats need a backend API — degrade to `—` */}
        <div className="mt-auto border-t border-console-line-2 px-3 pt-3 font-mono text-[10.5px] leading-[2] text-console-ink-weak">
          <p>PI 5 —</p>
          <p>MAC —</p>
          <p>DISK —</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex min-h-[44px] items-center tracking-[.2em] text-console-ink-weak transition-colors duration-[120ms] ease-out hover:text-console-ink"
          >
            ログアウト
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (< 900px) */}
        <header className="flex min-h-[56px] items-center justify-between border-b border-console-line-2 bg-console-band px-5 sm:px-8 desk:hidden">
          <Link
            href={role === 'viewer' ? '/sources' : '/dashboard'}
            className="text-[17px] font-bold tracking-[.02em] text-console-ink"
          >
            Catchup Feed
          </Link>
          <div className="flex items-center gap-4">
            <ConsoleClock className="text-[11.5px] text-console-ink-weak" />
            <button
              type="button"
              onClick={logout}
              className="flex min-h-[44px] items-center border border-console-line-3 px-3.5 text-[12px] text-console-ink-sub transition-colors duration-[120ms] ease-out hover:bg-console-hover"
            >
              ログアウト
            </button>
          </div>
        </header>

        {/* Horizontal tabs (640–899px) */}
        {flatItems.length > 0 && (
          <nav
            aria-label="メインナビゲーション"
            className="hidden overflow-x-auto border-b border-console-line-2 bg-console-rail sm:max-desk:flex"
          >
            {flatItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex min-h-[48px] items-center whitespace-nowrap px-[22px] py-[15px] text-[14px] transition-colors duration-[120ms] ease-out',
                    active
                      ? 'bg-console-sel-bg text-console-sel-ink'
                      : 'text-console-ink-sub hover:bg-console-hover'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Page content; reserve space for the fixed bottom tab bar on phones */}
        <main className="flex flex-1 flex-col pb-[62px] sm:pb-0">{children}</main>

        {/* Bottom tabs (< 640px) */}
        {flatItems.length > 0 && (
          <nav
            aria-label="メインナビゲーション"
            className="fixed inset-x-0 bottom-0 z-40 flex h-[62px] border-t border-console-line-2 bg-console-rail sm:hidden"
          >
            {bottomTabs.map((tab, i) => {
              const active = tab.paths.some((p) => isActivePath(pathname, p));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-[120ms] ease-out',
                    i > 0 && 'border-l border-console-line-2',
                    active ? 'bg-console-sel-bg text-console-sel-ink' : 'text-console-ink-sub'
                  )}
                >
                  <span className="text-[13.5px]">{tab.top}</span>
                  <span
                    className={cn(
                      'font-mono text-[9.5px] tracking-[.16em]',
                      active ? 'text-console-sel-ink' : 'text-console-ink-faint'
                    )}
                  >
                    {tab.sub}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
