# Legacy Documents(初代 catchup-feed / EDAF 体制期)

このディレクトリの文書はすべて **初代 catchup-feed(EDAF 体制)期のアーカイブ** であり、現行の構成・要件を反映していない(削除済みの Sentry や旧アーキテクチャを現行として記述している箇所がある)。role についても、ここに書かれているのは C-20 で撤去された初代の RBAC(複数ユーザー前提の権限モデル)であって、**現行の `admin` / `viewer` 2 ロール(D-27)とは別物**。現行の認可ルール — viewer が開けるのは `/sources` だけで、遮断はサーバー側の `src/proxy.ts` と backend の allowlist が担う — は本リポジトリの `README.md` / `CLAUDE.md` と親リポジトリの `docs/decisions.md` が正。`development-guidelines.md` は 2026-08-13 にここへ移した(記述が Next.js 16.1.1 / Turbopack ビルド前提のまま止まっており、現行の webpack ビルド(D-23)・ESLint 9 flat config・HttpOnly cookie 認証(D-22)と食い違うため)。

**設計・要件の正**:

- 親リポジトリ `docs/pulse-phase1〜3-design.md` — Phase 別の設計
- 親リポジトリ `docs/decisions.md` — 確定済みの決定事項(C-xx / D-xx)
- `design_handoff_catchup_feed_console/README.md`(親リポジトリ)— 画面デザインの正
- 本リポジトリの `README.md` と `CLAUDE.md` — 技術スタック・規約の現況

実装や設計判断の参照元としてこのディレクトリの文書を使用しないこと。内容は git 履歴にも残っているため、ディレクトリごと削除しても情報は失われない。
