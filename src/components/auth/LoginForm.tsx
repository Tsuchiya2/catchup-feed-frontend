'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLogin?: (email: string, password: string) => Promise<void>;
}

/**
 * LoginForm — 放送卓(改訂版) §2
 *
 * React Hook Form + Zod validation (unchanged behavior), restyled for the
 * always-dark console login screen: hairline borders, mono labels, cyan
 * focus ring (#36c8d6, outline-offset 2px), zero border-radius.
 */
export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      if (onLogin) {
        await onLogin(data.email, data.password);
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ログインに失敗しました。もう一度お試しください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName =
    'w-full border bg-[#101314] px-4 py-[15px] text-[15px] text-[#e6e4e0] ' +
    'placeholder:text-[#6d7276] transition-colors duration-[120ms] ease-out ' +
    'focus:border-[#36c8d6] focus-visible:outline focus-visible:outline-1 ' +
    'focus-visible:outline-offset-2 focus-visible:outline-[#36c8d6] ' +
    'disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-[14.5px]';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[420px] flex-col gap-[26px]"
    >
      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-mono text-[11px] tracking-[.18em] text-[#6d7276]">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`${inputClassName} ${errors.email ? 'border-console-warn' : 'border-[#2a3033]'}`}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="font-mono text-[11px] text-console-warn" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="font-mono text-[11px] tracking-[.18em] text-[#6d7276]">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={`${inputClassName} font-mono tracking-[.3em] ${
            errors.password ? 'border-console-warn' : 'border-[#2a3033]'
          }`}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="font-mono text-[11px] text-console-warn" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="border border-console-warn px-4 py-3 font-mono text-[11.5px] text-console-warn"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="min-h-[44px] w-full bg-[#36c8d6] px-[30px] py-3.5 text-center text-[14px] font-bold tracking-[.06em] text-[#0d0f10] transition-colors duration-[120ms] ease-out hover:bg-[#4fd2de] disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? 'ログイン中…' : 'ログイン'}
      </button>
    </form>
  );
}
