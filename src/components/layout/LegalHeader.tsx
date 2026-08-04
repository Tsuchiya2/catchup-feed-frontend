'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/api';

interface LegalHeaderProps {
  /**
   * Role decoded server-side from the auth cookie by the legal layout, or
   * undefined for anonymous visitors. We deliberately do NOT call GET /auth/me
   * here: on these public pages an anonymous visitor would get a 401, and the
   * API client force-redirects every 401 to /login — which would make /terms
   * and /privacy unreachable while signed out.
   */
  role?: UserRole;
}

/**
 * Header for the public legal pages (/terms, /privacy).
 *
 * Reuses the shared Header: signed-in visitors get the same role-scoped
 * navigation and logout as protected pages; anonymous visitors only see the
 * legal links.
 */
export function LegalHeader({ role }: LegalHeaderProps) {
  const { logout } = useAuth();

  if (!role) {
    return <Header showAuthLinks={false} />;
  }

  return <Header onLogout={logout} role={role} />;
}
