# catchup-feed-frontend(pulse ダッシュボード)

Next.js(App Router)+ TypeScript。全体像と規約は親ディレクトリの `CLAUDE.md` と `docs/pulse-phase1-design.md` が正。ここにはリポジトリ固有の事項のみ書く。

## このリポジトリの約束
- API 型は手書きせず `npm run generate:api` で backend の Swagger から生成する(backend 起動が前提。生成済み `src/types/api.d.ts` を正として扱う)
- `npm run lint`(max-warnings 0)と `npm run test` が完了条件。画面追加時は Storybook のストーリーも追う
- PWA(Serwist)を壊さない。ビルド後にスマホ幅での表示確認を必ず行う(ユーザーの主要動線はスマホ)
- UI 部品は Radix + Tailwind 4 の既存パターンに合わせる。新規コンポーネントライブラリの導入は親の承認制
- Sentry は D-8 決定により削除済み。再導入しない(可観測性は logger.ts のコンソールログと backend のアクセスログで足りる)

## Phase 1 の追加画面
1. 友人管理(subscribers CRUD、論理削除)
2. トークン発行・失効(D-5: ハッシュ保存のため購読 URL は発行時に一度だけ表示、以後は再発行のみ。失効の不可逆性を UI で明示)
3. アクセスログ(友人単位の時系列+放置検知の集計ビュー)

デプロイ先は Vercel から Pi ローカル(Tailscale/Tunnel 経由)へ移行予定。next build がスタンドアロンで動く構成を維持する。
