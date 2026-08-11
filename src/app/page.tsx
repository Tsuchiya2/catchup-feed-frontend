import Link from 'next/link';
import Image from 'next/image';

/**
 * Landing Page — 放送卓(改訂版) §1
 *
 * External-facing page, always dark. Carries ZERO operational information
 * (no article counts, no uptime, no episode numbers). The ON AIR dot is
 * always unlit (#2f3639) and the only outbound action is ログイン.
 */

/**
 * Decorative level meter: 18 static bars (24–88% of 36px), achromatic only.
 * Heights are hardcoded — never animated, never data-driven (README §1).
 */
const METER_HEIGHTS = [42, 66, 30, 84, 52, 74, 26, 60, 88, 38, 70, 46, 80, 32, 58, 72, 40, 64];
const METER_COLORS = ['#2a3033', '#3a4145', '#23282c'];

function LogoPanel({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-console-logo ${className ?? ''}`}>
      <Image
        src="/catchup-feed-logo.png"
        alt="Catchup Feed — 複数の情報源がひとつの番組に収束し、各配信先へ届く構図のロゴ"
        fill
        priority
        sizes="(min-width: 900px) 50vw, 100vw"
        className="object-contain"
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="console-dark flex min-h-screen flex-col bg-[#0d0f10] text-[#e6e4e0]">
      {/* Header */}
      <header className="flex min-h-[63px] items-center justify-between gap-4 border-b border-[#1a1e20] px-5 py-2.5 sm:max-desk:px-8 desk:pl-12 desk:pr-10">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-[7px] w-[7px] rounded-full bg-console-off" />
          <span className="text-[17px] font-bold tracking-[.02em] text-[#e6e4e0]">
            Catchup Feed
          </span>
        </div>
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
            href="/login"
            className="flex min-h-[44px] items-center border border-[#3a4145] px-[18px] text-[13px] tracking-[.1em] text-[#c3c7c9] transition-colors duration-[120ms] ease-out hover:bg-[#151a1c]"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* Middle: hero + logo panel (stacked below 900px, 2 columns above) */}
      <div className="flex flex-1 flex-col desk:grid desk:grid-cols-2">
        <LogoPanel className="order-1 shrink-0 border-b border-[#1a1e20] max-sm:h-[236px] sm:max-desk:h-[420px] desk:order-2 desk:border-b-0 desk:border-l" />

        <div className="order-2 flex flex-col gap-[26px] px-5 py-8 sm:max-desk:px-8 desk:order-1 desk:pb-[30px] desk:pl-12 desk:pr-11 desk:pt-[54px]">
          <h1 className="max-w-[520px] text-[26px] font-bold leading-[1.6] tracking-[.01em] sm:max-desk:text-[36px] desk:text-[38px]">
            早朝に技術情報を
            <br />
            10分間の音声で
            <br className="sm:max-desk:hidden" />
            お届け。
          </h1>
          <p className="max-w-[460px] text-[14.5px] leading-[2.1] text-[#a8adb0] [text-wrap:pretty]">
            記事も動画も音声も、夜のうちに一本の番組へ。手も目も塞がっている時間に、耳だけで受け取れる形にしています。
          </p>
          <div>
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center bg-[#36c8d6] px-7 py-3.5 text-[14px] font-bold text-[#0d0f10] transition-colors duration-[120ms] ease-out hover:bg-[#4fd2de]"
            >
              ログイン
            </Link>
          </div>

          {/* Decorative level meter — static, achromatic, desktop only */}
          <div aria-hidden className="mt-auto hidden h-9 items-end gap-1 desk:flex">
            {METER_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="w-1"
                style={{ height: `${h}%`, backgroundColor: METER_COLORS[i % METER_COLORS.length] }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 集・編・送 band */}
      <div className="grid border-t border-[#1f2426] bg-[#101314] sm:grid-cols-3">
        <div className="flex gap-3.5 border-[#1f2426] p-5 desk:pl-12">
          <span className="font-mono text-[11px] tracking-[.18em] text-[#6d7276]">集</span>
          <p className="text-[13.5px] leading-[1.9] text-[#c3c7c9]">
            複数の情報を、
            <br className="hidden sm:inline" />
            夜のあいだに集める
          </p>
        </div>
        <div className="flex gap-3.5 border-t border-[#1f2426] p-5 sm:border-l sm:border-t-0">
          <span className="font-mono text-[11px] tracking-[.18em] text-[#6d7276]">編</span>
          <p className="text-[13.5px] leading-[1.9] text-[#c3c7c9]">
            台本に起こし、
            <br className="hidden sm:inline" />
            声にして一本にまとめる
          </p>
        </div>
        <div className="flex gap-3.5 border-t border-[#1f2426] p-5 sm:border-l sm:border-t-0 desk:pr-10">
          <span className="font-mono text-[11px] tracking-[.18em] text-[#8b7ae6]">送</span>
          <p className="text-[13.5px] leading-[1.9] text-[#c3c7c9]">
            毎朝、複数のアプリに
            <br className="hidden sm:inline" />
            お届け
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-[#1a1e20] px-5 py-[13px] font-mono text-[11px] text-[#4f5457] sm:max-desk:px-8 desk:pl-12 desk:pr-10">
        <span>&copy; {new Date().getFullYear()} Catchup Feed</span>
        <span className="tracking-[.2em]">SELF-HOSTED</span>
      </footer>
    </main>
  );
}
