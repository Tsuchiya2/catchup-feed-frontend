# catchup-feed — 運用ダッシュボード (Frontend)

<p align="center">
  <strong>毎朝10〜15分の音声ラジオ番組をポッドキャストアプリへ配信する、個人向け学習システム「catchup-feed」の運用ダッシュボード</strong>
</p>

<p align="center">
  <a href="#概要">概要</a> •
  <a href="#主な画面機能">画面/機能</a> •
  <a href="#技術スタック">技術スタック</a> •
  <a href="#セットアップ">セットアップ</a> •
  <a href="#api-型生成">API 型生成</a> •
  <a href="#環境変数">環境変数</a> •
  <a href="#テスト">テスト</a>
</p>

---

## 概要

現行の **catchup-feed** は、初代 catchup-feed(ニュースアグリゲータ)の後継システムです。初代の反省 —「配信した記事数」を最適化しても要約は読まれない — を踏まえ、本システムが最適化する目標は **理解の定着** です。

収集した記事の要約を素材に、毎朝10〜15分の **音声ラジオ番組** を生成し、ポッドキャストアプリへ配信します。可処分時間が細切れなユーザーが、移動中や家事の合間に耳で消化できることを狙いとしています。同じ番組を友人にも配信し、フィードバックを得ます。

本リポジトリはそのフロントエンド、すなわち **Next.js 製の PWA 運用ダッシュボード** です。番組の再生 UI ではなく、**運用管理 UI** に特化しています:

- **ソース管理** — クロール対象の RSS/Atom ソースの追加・有効/無効・カテゴリ/言語設定
- **友人(購読者)/トークン管理** — ポッドキャスト購読トークンの発行・失効。購読 URL は発行時に一度だけ表示
- **アクセスログ閲覧** — 誰がいつどのエピソードを取得したか。放置(一定期間アクセスなし)の検知

音声番組の生成・配信そのものはバックエンド([catchup-feed-backend](https://github.com/Tsuchiya2/catchup-feed-backend))が担います。本フロントエンドは、そのバックエンドの管理エンドポイントを叩く画面です。

### 設計原則

- **単一ユーザー右サイズ** — 単一管理者向け。過度な分散化・監視/分析基盤を持ち込まない。認証は JWT のみ(認証済み=管理者に単純化。role クレームは廃止済み)
- **ゼロ円運用** — 新規の固定費を増やさない。Sentry など外部の可観測性 SaaS は削除済み(再導入しない)
- **API 契約はバックエンドが正** — 手書きの API 型を作らず、バックエンドの Swagger から `npm run generate:api` で TypeScript 型を再生成する

---

## 主な画面/機能

ナビゲーション上の各画面(認証後):

| 画面 | パス | 内容 |
|------|------|------|
| **Dashboard** | `/dashboard` | 概況 |
| **Sources** | `/sources` | クロール対象 RSS/Atom ソースの CRUD、有効/無効・カテゴリ/言語設定 |
| **Friends** | `/subscribers`, `/subscribers/[id]` | 購読者(友人)の管理。無効化は論理削除(履歴を残したまま非アクティブ化) |
| **Access Logs** | `/access-logs` | 購読者ごとのアクセス概況(放置検知)と、時系列アクセスログ。友人単位で絞り込み可 |
| **Review** | `/learning` | 学習ループ関連(Phase 2、開発中) |

### トークン発行と一度きり表示

友人詳細画面から購読トークンを発行すると、購読 URL(`https://<feed domain>/feeds/{token}/feed.xml` 形式)が **その場で一度だけ** 表示されます。バックエンドはトークンをハッシュ(SHA-256)で保存するため、平文の URL は二度と取得できません(設計上の決定 D-5)。ダイアログは Escape / 背景クリックで閉じられないようにガードし、「閉じると URL は失われ、再取得はできない(復旧は失効+再発行のみ)」ことを明示します。失効は取り消せない操作であることも UI 上で明示しています。

### PWA / モバイル

ユーザーの主要動線はスマホです。本アプリは [Serwist](https://serwist.pages.dev/) による PWA(Service Worker)対応で、モバイルファーストのレスポンシブ UI を維持します。

---

## 技術スタック

バージョンは `package.json` を正とします(抜粋)。

| カテゴリ | 技術 |
|----------|------|
| **フレームワーク** | [Next.js 16](https://nextjs.org/) (App Router) / [React 19](https://react.dev/) |
| **言語** | [TypeScript 5](https://www.typescriptlang.org/) (Strict) |
| **ランタイム** | Node.js 24 |
| **スタイリング** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI コンポーネント** | [Radix UI](https://www.radix-ui.com/) primitives + shadcn/ui スタイル(cva / clsx / tailwind-merge) |
| **アイコン** | [lucide-react](https://lucide.dev/) |
| **データ取得** | [TanStack Query 5](https://tanstack.com/query) |
| **フォーム** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **認証** | JWT([jose](https://github.com/panva/jose)) |
| **PWA** | [Serwist](https://serwist.pages.dev/) (Service Worker) |
| **テーマ** | [next-themes](https://github.com/pacocoursey/next-themes)(ダークモード) |
| **API 型生成** | [openapi-typescript](https://openapi-ts.pages.dev/) + [swagger2openapi](https://github.com/Mermade/oas-kit)(Swagger 2.0 → OpenAPI 3 変換) |
| **テスト** | [Vitest 4](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + [Playwright](https://playwright.dev/) |
| **UI カタログ** | [Storybook 10](https://storybook.js.org/) |
| **Lint / Format** | [ESLint 9](https://eslint.org/) (flat config) + [Prettier](https://prettier.io/) |

---

## セットアップ

### 前提

- Node.js 24 系
- バックエンド([catchup-feed-backend](https://github.com/Tsuchiya2/catchup-feed-backend))が起動していること(API 型生成・実データ表示に必要)

### ローカル(Node で直接起動)

```bash
git clone https://github.com/Tsuchiya2/catchup-feed-front.git
cd catchup-feed-front

cp .env.example .env   # 環境変数を用意
npm install
npm run dev            # http://localhost:3000
```

### Docker Compose(任意)

`compose.yml` を使う場合。バックエンドが作成する外部ネットワーク `catchup-feed_backend` が存在している必要があります。

```bash
cp .env.example .env
docker compose up -d
docker compose logs -f web
```

コンテナはポート `3001` で公開されます(ホストの `3000` を Grafana 等と競合させないため、`3001:3000` にマッピング)。

### 主なスクリプト

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` / `npm run start` | 本番ビルド / 本番起動 |
| `npm run lint` | ESLint(`--max-warnings 0`。警告ゼロが完了条件) |
| `npm run lint:fix` | ESLint 自動修正 |
| `npm run format` / `npm run format:check` | Prettier 整形 / チェック |
| `npm run generate:api` | Swagger から API 型を再生成 |
| `npm run test` | Vitest(ユニット/統合) |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run test:e2e` | Playwright(E2E) |
| `npm run storybook` / `npm run build-storybook` | Storybook 起動 / ビルド |
| `npm run analyze` | バンドル解析ビルド |

---

## API 型生成

API の型は手書きしません。バックエンドの Swagger 定義を正とし、`scripts/generate-api.mjs` が Swagger 2.0 → OpenAPI 3 変換を挟んで TypeScript 型を生成します。

```bash
# バックエンドがローカル起動している場合(既定: http://localhost:8080/swagger/doc.json)
npm run generate:api

# 明示的に spec を指定する場合(URL でもファイルパスでも可)
npm run generate:api -- http://localhost:8080/swagger/doc.json
```

- 生成物: `src/types/generated/api.d.ts`(**手で編集しない**)
- アプリ側で使う読みやすいエイリアスは `src/types/api.d.ts` に置き、生成ファイルから導出します

---

## 環境変数

`.env.example` をコピーして `.env` を作成します。主なもの(全量は `.env.example` を参照):

| 変数 | 既定 / 例 | 用途 |
|------|-----------|------|
| `NODE_ENV` | `development` | 実行環境 |
| `NEXT_PUBLIC_API_URL` | `http://app:8080` | バックエンド API の URL |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | API タイムアウト(ms) |
| `NEXT_PUBLIC_API_RETRY_ATTEMPTS` | `3` | API リトライ回数 |
| `NEXT_PUBLIC_API_RETRY_DELAY` | `1000` | リトライ間隔(ms) |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_SHORT_NAME` | — | アプリ名(メタデータ / PWA マニフェスト) |
| `NEXT_PUBLIC_APP_URL` | — | 公開 URL(メタデータ / OGP) |
| `NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD` | `300` | トークン更新の閾値(秒) |
| `NEXT_PUBLIC_TOKEN_GRACE_PERIOD` | `60` | 期限後の更新猶予(秒) |
| `NEXT_PUBLIC_FEATURE_PWA` | `false` | PWA 機能フラグ |
| `NEXT_PUBLIC_FEATURE_DARK_MODE` | `true` | ダークモード切り替え |
| `NEXT_PUBLIC_LOG_LEVEL` / `NEXT_PUBLIC_LOG_FORMAT` | `debug` / `pretty` | ロギング |

---

## テスト

```bash
npm run test            # Vitest(ユニット/統合)
npm run test:coverage   # カバレッジ
npm run test:e2e        # Playwright(E2E)
npm run storybook       # Storybook でコンポーネントを確認
```

各画面・コンポーネントには Vitest のテストと Storybook のストーリーを添えます。`npm run lint`(警告ゼロ)と `npm run test` の成功が変更の完了条件です。

---

## プロジェクト構成(抜粋)

```
src/
├── app/
│   ├── (auth)/login/               # ログイン
│   ├── (legal)/                    # 利用規約・プライバシー
│   ├── (protected)/                # 認証必須ルート
│   │   ├── dashboard/
│   │   ├── sources/                # ソース管理
│   │   ├── subscribers/            # 友人管理
│   │   │   └── [id]/               # 友人詳細(トークン発行・失効)
│   │   ├── access-logs/            # アクセスログ
│   │   ├── articles/
│   │   └── learning/               # 学習ループ(Phase 2)
│   └── api/                        # ルートハンドラ(health など)
├── components/
│   ├── ui/                         # Radix ベースの UI 部品
│   ├── subscribers/                # 友人・トークン系ダイアログ
│   ├── access-logs/                # アクセスログ表示
│   ├── sources/                    # ソース系
│   └── ...
├── hooks/                          # TanStack Query フック
├── lib/                            # API クライアント・認証など
├── types/
│   ├── api.d.ts                    # アプリ用エイリアス
│   └── generated/api.d.ts          # Swagger からの自動生成(編集禁止)
└── ...
```

---

## デプロイ

現状は Vercel Edge で配信。今後、バックエンドが動作する Raspberry Pi 5 上のローカル配信(Tailscale / Cloudflare Tunnel 経由)へ移行予定です。`next build` がスタンドアロンで動く構成を維持します。

---

## 関連

- **[catchup-feed-backend](https://github.com/Tsuchiya2/catchup-feed-backend)** — 音声番組の生成・フィード配信・トークン認証を担う Go バックエンド
- 設計・要件の正は親リポジトリの `docs/pulse-phase1-design.md` / `docs/decisions.md`
- 旧 catchup-feed 期の文書は [docs/legacy/](./docs/legacy/README.md) にアーカイブ済み(参照非推奨)

---

<p align="center">
  Next.js・TypeScript・Tailwind CSS で構築 — 単一ユーザー右サイズ / ゼロ円運用
</p>
