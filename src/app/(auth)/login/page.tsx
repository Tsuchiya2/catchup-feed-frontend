'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * Login Page — 放送卓(改訂版) §2
 *
 * Always dark (brand-fixed). Admin login only — the page states that the
 * service is operated for personal use and shows no sign-up affordance.
 * Authenticated users are redirected to /dashboard by the proxy.
 */
export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="console-dark flex min-h-screen flex-col bg-[#0d0f10] text-[#e6e4e0]">
      {/* Header (same lockup as landing; brand links back to /) */}
      <header className="flex min-h-[63px] items-center justify-between gap-4 border-b border-[#1a1e20] px-5 py-2.5 sm:max-desk:px-8 desk:pl-12 desk:pr-10">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-console-off" />
          <span className="text-[17px] font-bold tracking-[.02em] text-[#e6e4e0]">
            Catchup Feed
          </span>
        </Link>
        <nav className="flex items-center gap-[26px] font-mono text-[11.5px] text-[#6d7276]">
          <Link
            href="/terms"
            className="flex min-h-[44px] items-center transition-colors duration-[120ms] ease-out hover:text-[#9aa0a4]"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="flex min-h-[44px] items-center transition-colors duration-[120ms] ease-out hover:text-[#9aa0a4]"
          >
            プライバシー
          </Link>
        </nav>
      </header>

      {/* Body: form + logo panel (stacked below 900px, 2 columns above) */}
      <div className="flex flex-1 flex-col desk:grid desk:grid-cols-2">
        <div className="relative order-1 shrink-0 overflow-hidden border-b border-[#1a1e20] bg-console-logo max-sm:h-[200px] sm:max-desk:h-[420px] desk:order-2 desk:border-b-0 desk:border-l">
          <Image
            src="/catchup-feed-logo.png"
            alt=""
            fill
            priority
            sizes="(min-width: 900px) 50vw, 100vw"
            className="object-contain"
          />
        </div>

        <div className="order-2 flex flex-1 flex-col gap-[26px] px-5 py-10 sm:px-12 desk:order-1 desk:pb-12 desk:pt-24">
          <h1 className="text-[26px] font-bold leading-[1.5] desk:text-[38px]">ログイン</h1>

          <LoginForm onLogin={login} />

          <p className="max-w-[420px] font-mono text-[11.5px] leading-[2] text-[#6d7276]">
            このサービスは個人利用の範囲で運用しております。
          </p>

          {/* OFF AIR line — static copy, not live status */}
          <div className="mt-auto flex items-center gap-3 pt-10">
            <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-console-off" />
            <span className="font-mono text-[11px] tracking-[.22em] text-[#3a4145]">
              OFF AIR — 次の送出は 05:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
