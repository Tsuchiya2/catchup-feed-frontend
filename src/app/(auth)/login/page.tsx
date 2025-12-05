'use client';

import * as React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * Login Page
 *
 * Public page that displays the login form.
 * Authenticated users will be redirected to /dashboard by middleware.
 */
export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Catchup Feed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your personalized news feed
          </p>
        </div>

        <LoginForm onLogin={login} />
      </div>
    </div>
  );
}
