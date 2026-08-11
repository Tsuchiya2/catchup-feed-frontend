import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 - Catchup Feed',
  description: 'Catchup Feed の利用規約',
};

/**
 * Terms of service — 放送卓(改訂版)
 *
 * Written for what this service actually is: a self-hosted, personal-use
 * radio feed shared with a handful of invited friends. No signup flows, no
 * commercial claims. Body text follows the console reading style
 * (Noto Sans JP 15px / line-height 2.1 / text-wrap: pretty).
 */

const SECTIONS: ReadonlyArray<{ heading: string; body: React.ReactNode }> = [
  {
    heading: '1. このサービスについて',
    body: (
      <p>
        Catchup
        Feed(以下「本サービス」)は、管理者が個人利用の範囲で運用する自家ホスティングのシステムです。公開されている記事・動画・音声を収集し、要約して毎朝の音声番組として、管理者本人と管理者が招待した友人に配信します。一般向けの受付・登録は行っていません。
      </p>
    ),
  },
  {
    heading: '2. 利用できる人',
    body: (
      <p>
        本サービスを利用できるのは、管理者と、管理者から購読 URL
        またはアカウントを直接受け取った友人のみです。受け取った購読 URL
        は本人限りのものとして扱い、第三者へ再配布しないでください。
      </p>
    ),
  },
  {
    heading: '3. コンテンツの権利',
    body: (
      <p>
        番組で紹介する記事・動画・音声の権利は、それぞれの提供元に帰属します。本サービスが生成する要約・台本・音声は、原典の理解を助ける個人利用の範囲で作成されるものであり、原典の代替を意図しません。原文へのリンクを原則として併記します。
      </p>
    ),
  },
  {
    heading: '4. 禁止事項',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>購読 URL・トークン・アカウントの第三者への譲渡や公開</li>
        <li>システムへの不正アクセスや、運用を妨げる行為</li>
        <li>配信されたコンテンツの商用利用や再配布</li>
      </ul>
    ),
  },
  {
    heading: '5. 提供の中断・停止',
    body: (
      <p>
        本サービスは「壊れても翌日勝手に戻る」ことを設計目標とする個人運用のシステムです。機材の不在や障害によりエピソードが欠番になること、予告なく提供を中断・終了することがあります。これらについて管理者は責任を負いません。
      </p>
    ),
  },
  {
    heading: '6. 規約の変更',
    body: (
      <p>
        本規約は必要に応じて変更されることがあります。変更後の内容は本ページに掲載した時点で効力を持ちます。
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <article>
      <header className="mb-10">
        <h1 className="text-[26px] font-bold leading-[1.5] tracking-[.01em]">利用規約</h1>
        <p className="mt-3 font-mono text-[11px] tracking-[.18em] text-[#6d7276]">
          最終更新 2026.08.11
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-[15px] font-bold leading-[1.6]">{section.heading}</h2>
            <div className="text-[15px] leading-[2.1] text-[#c3c7c9] [text-wrap:pretty]">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
