'use client';

import * as React from 'react';

/**
 * Global Error Boundary — 放送卓(改訂版)
 *
 * Quiet console-styled failure screen. This system is designed to degrade
 * ("壊れても翌日勝手に戻る"), so the tone is calm: warm accent, no red
 * except destructive confirmations, mono status line, hairline buttons.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-console-bg px-5 py-12 text-console-ink">
      <div className="w-full max-w-md border border-console-line-2 bg-console-panel p-8">
        <p className="font-mono text-[11px] tracking-[.22em] text-console-warn">ERROR</p>
        <h1 className="mt-3 text-[17px] font-bold leading-[1.6]">問題が発生しました</h1>
        <p className="mt-2 text-[13px] leading-[2] text-console-ink-weak [text-wrap:pretty]">
          予期しないエラーが発生しました。再試行しても直らない場合は、時間をおいてからやり直してください。
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-4 border border-console-line-2 p-3 font-mono text-[11px] leading-[1.8] text-console-ink-weak">
            {error.message}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="flex min-h-[44px] items-center justify-center bg-console-sel-bg px-5 text-[13px] font-bold text-console-sel-ink transition-colors duration-[120ms] ease-out hover:bg-console-sel-hover focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
          >
            再試行
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="flex min-h-[44px] items-center justify-center border border-console-line-3 px-5 text-[13px] text-console-ink-sub transition-colors duration-[120ms] ease-out hover:bg-console-hover focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
