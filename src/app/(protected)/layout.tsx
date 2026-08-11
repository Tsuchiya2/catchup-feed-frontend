'use client';

import * as React from 'react';
import { ConsoleShell } from '@/components/console/ConsoleShell';

/**
 * Protected Layout — 放送卓(改訂版)
 *
 * Wraps every authenticated page in the console shell: left rail (>= 900px),
 * top tabs (640–899px) or bottom tabs (< 640px). Navigation is scoped by the
 * role from GET /auth/me inside the shell; the proxy and backend enforce
 * access regardless of what the client renders.
 */
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
