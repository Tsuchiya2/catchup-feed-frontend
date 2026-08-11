import Link from 'next/link';

/**
 * Not Found Page (404) — 放送卓(改訂版)
 *
 * Console-styled: mono status code, hairline frame, one way back.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-console-bg px-5 py-12 text-console-ink">
      <div className="w-full max-w-md border border-console-line-2 bg-console-panel p-8">
        <p className="font-mono text-[11px] tracking-[.22em] text-console-ink-faint">
          404 — NOT FOUND
        </p>
        <h1 className="mt-3 text-[17px] font-bold leading-[1.6]">ページが見つかりません</h1>
        <p className="mt-2 text-[13px] leading-[2] text-console-ink-weak [text-wrap:pretty]">
          お探しのページは存在しないか、移動しました。
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center border border-console-line-3 px-5 text-[13px] text-console-ink-sub transition-colors duration-[120ms] ease-out hover:bg-console-hover focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
