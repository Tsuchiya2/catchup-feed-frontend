import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Catchup Feed',
  description: 'Sign in to your Catchup Feed account',
};

/**
 * Auth Layout
 *
 * Simple layout for authentication pages (login, etc.)
 * No header or navigation - just centered content
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
