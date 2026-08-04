import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import { LegalHeader } from '@/components/layout/LegalHeader';
import { Footer } from '@/components/layout/Footer';
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

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = roleFromAuthCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Effects - matching main theme */}
      <div className="pointer-events-none fixed inset-0 bg-cyber-radial" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(190_100%_50%/0.08),transparent)]" />

      {/* Content */}
      <div className="relative">
        <LegalHeader role={role} />
        <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
