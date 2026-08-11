import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import type { UserRole } from '@/types/api';

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

/** Same HttpOnly auth cookie the proxy checks (see src/proxy.ts). */
const AUTH_COOKIE_NAME = 'catchup_feed_auth_token';

/** 30-second clock-skew buffer, mirroring isTokenValid in src/proxy.ts. */
const CLOCK_SKEW_BUFFER_MS = 30 * 1000;

/**
 * Decode the role claim from the auth cookie for display purposes only.
 *
 * Like the proxy, this checks expiry but not the signature — a forged role can
 * at most change which nav links render; every API call is re-authorized by
 * the backend. Anything unreadable, expired, or without a known role renders
 * the anonymous header.
 */
function roleFromAuthCookie(token: string | undefined): UserRole | undefined {
  if (!token) {
    return undefined;
  }
  try {
    const payload = decodeJwt(token);
    if (payload.exp && Date.now() >= payload.exp * 1000 + CLOCK_SKEW_BUFFER_MS) {
      return undefined;
    }
    const { role } = payload;
    return role === 'admin' || role === 'viewer' ? role : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Legal layout — 放送卓(改訂版)
 *
 * Always-dark public chrome, identical vocabulary to the landing/login
 * header: unlit dot + wordmark left, mono legal links + one action right.
 * Signed-in visitors get a link back to their console instead of ログイン.
 */
export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = roleFromAuthCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  const action = role
    ? { href: role === 'viewer' ? '/sources' : '/dashboard', label: 'コンソール' }
    : { href: '/login', label: 'ログイン' };

  return (
    <div className="console-dark flex min-h-screen flex-col bg-[#0d0f10] text-[#e6e4e0]">
      {/* Header (same construction as the landing page) */}
      <header className="flex min-h-[63px] items-center justify-between gap-4 border-b border-[#1a1e20] px-5 py-2.5 sm:max-desk:px-8 desk:pl-12 desk:pr-10">
        <Link href="/" className="flex items-center gap-3">
          <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-console-off" />
          <span className="text-[17px] font-bold tracking-[.02em] text-[#e6e4e0]">
            Catchup Feed
          </span>
        </Link>
        <div className="flex items-center gap-[26px]">
          <nav className="hidden items-center gap-[26px] font-mono text-[11.5px] text-[#6d7276] sm:flex">
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
          <Link
            href={action.href}
            className="flex min-h-[44px] items-center border border-[#3a4145] px-[18px] text-[13px] tracking-[.1em] text-[#c3c7c9] transition-colors duration-[120ms] ease-out hover:bg-[#151a1c]"
          >
            {action.label}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-[720px] flex-1 px-5 py-10 sm:px-8 sm:py-12">
        {children}
      </main>

      {/* Footer (same construction as the landing page) */}
      <footer className="flex items-center justify-between border-t border-[#1a1e20] px-5 py-[13px] font-mono text-[11px] text-[#4f5457] sm:max-desk:px-8 desk:pl-12 desk:pr-10">
        <span>&copy; {new Date().getFullYear()} Catchup Feed</span>
        <span className="tracking-[.2em]">SELF-HOSTED</span>
      </footer>
    </div>
  );
}
