import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー - Catchup Feed',
  description: 'Catchup Feed のプライバシーポリシー',
};

/**
 * Privacy policy — 放送卓(改訂版)
 *
 * Describes only what this self-hosted system actually collects: the
 * admin/viewer login credentials, feed tokens (stored hashed), and feed
 * access logs kept per friend to notice when someone quietly stops
 * listening. No analytics, no ad tracking, no third-party sharing.
 */

const SECTIONS: ReadonlyArray<{ heading: string; body: React.ReactNode }> = [
  {
    heading: '1. 基本方針',
    body: (
      <p>
        Catchup
        Feed(以下「本サービス」)は、管理者が個人利用の範囲で運用する自家ホスティングのシステムです。取得する情報は運用に必要な最小限にとどめ、広告・解析目的のトラッキングは行いません。第三者へ個人情報を販売・提供することもありません。
      </p>
    ),
  },
  {
    heading: '2. 取得する情報',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>ログイン用のメールアドレスとパスワード(パスワードはハッシュ化して保存)</li>
        <li>友人の名前・メールアドレス・メモ(管理者が登録したもの)</li>
        <li>
          フィードへのアクセス記録(いつ・どの購読トークンで・何を取得したか、および User-Agent)
        </li>
      </ul>
    ),
  },
  {
    heading: '3. 利用目的',
    body: (
      <p>
        取得した情報は、認証、番組の配信、そして「誰がまだ聴いていて、誰が離れてしまったか」を管理者が把握して番組を改善するためだけに使います。アクセス記録は配信の改善以外の目的には使用しません。
      </p>
    ),
  },
  {
    heading: '4. Cookie',
    body: (
      <p>
        本サービスが使用する Cookie は、ログイン状態を保持する認証用 Cookie(HttpOnly)
        のみです。広告・解析用の Cookie は使用しません。
      </p>
    ),
  },
  {
    heading: '5. 保管と安全管理',
    body: (
      <p>
        データは管理者が管理する自宅サーバーに保管されます。購読トークンはハッシュ化して保存され、発行時に一度だけ表示された後は誰にも(管理者にも)復元できません。通信は
        TLS で保護されます。
      </p>
    ),
  },
  {
    heading: '6. 削除の求め',
    body: (
      <p>
        友人として登録された方は、自分の登録情報やアクセス記録の削除をいつでも管理者に直接依頼できます。配信の停止(購読トークンの失効)もあわせて対応します。
      </p>
    ),
  },
  {
    heading: '7. ポリシーの変更',
    body: (
      <p>
        本ポリシーは必要に応じて変更されることがあります。変更後の内容は本ページに掲載した時点で効力を持ちます。
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <article>
      <header className="mb-10">
        <h1 className="text-[26px] font-bold leading-[1.5] tracking-[.01em]">
          プライバシーポリシー
        </h1>
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
