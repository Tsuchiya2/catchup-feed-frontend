# catchup-feed-frontend(pulse ダッシュボード)

Next.js 16(App Router)+ React 19 + TypeScript 5.9 + Tailwind 4 の PWA 運用ダッシュボード。Phase 1〜3 の画面は実装済みで、Vercel(`pulse.catchup-feed.com`)から Pi の backend(`radio.catchup-feed.com`)を叩いて運用中。全体像と規約は親ディレクトリの `CLAUDE.md`、Phase 別設計は `docs/pulse-phase1〜3-design.md` と `docs/decisions.md`、**画面デザインは `design_handoff_catchup_feed_console/README.md`(放送卓)** が正。ここにはリポジトリ固有の事項のみ書く。

## このリポジトリの約束

- API 型は手書きせず `npm run generate:api` で backend の Swagger から生成する(C-19。生成済み `src/types/generated/api.d.ts` を正として扱い、読みやすいエイリアスだけを `src/types/api.d.ts` に置く)
- `npm run lint`(max-warnings 0)と `npm run test`(Vitest)が完了条件。画面を触ったら `npm run test:e2e`(Playwright)と `npm run build` も通す。画面追加時は Storybook のストーリーも追う
- **本番ビルドは webpack**(`next build`)。Turbopack にすると `@serwist/next` の Service Worker 生成が走らず `public/sw.js` が作られない=PWA のオフラインキャッシュが消える(D-23)。dev サーバは Next 16 既定の Turbopack のままでよい
- PWA(Serwist)を壊さない。**機微 API を足したら `src/sw.ts` の `SENSITIVE_API_SEGMENTS` にも追加する**(NetworkOnly にしないと私的データがディスクキャッシュに残る)。ビルド後にスマホ幅での表示確認を必ず行う(ユーザーの主要動線はスマホ)
- 認証は backend 発行の HttpOnly cookie(D-22)。localStorage / JS からの cookie 書き込みで JWT を保持しない。**ルート保護は `src/proxy.ts`(サーバー側)が担い、UI で隠すだけの担保は不可**。`viewer` ロール(D-27)は `/sources` の閲覧のみで、それ以外は proxy で遮断する
- UI 部品は Radix + Tailwind 4 の既存パターン(`src/components/ui/`)と放送卓トークン(`--color-console-*`、角丸 0・影なし・1px ヘアライン)に合わせる。新規コンポーネントライブラリの導入は親の承認制
- **backend API が無い領域をプレースホルダ(`—`)で描かない**。D-35(記事の音声プレイヤー)・D-38(記事詳細の右サイドバー / 左レールのホスト状態)・D-39(概況の5領域)で恒久 `—` を撤去した。復活させるなら backend の API 追加が先。design_handoff README の該当節も同時に改訂する
- レイアウトは 3 段レスポンシブ(`>= 900px` レール / 640–899px 上部タブ / `< 640px` 下部タブ)。`flex-1` を本文 grid に直接使うと狭幅で空白が伸びる回帰を 2 度出しているため、`desk:flex-1` の形に揃える。ビューポート依存の回帰は `tests/e2e/dashboard/layout.spec.ts` が見張る
- Sentry は D-8 決定により削除済み。再導入しない(可観測性は `logger.ts` のコンソールログと backend のアクセスログで足りる)
- 初代 catchup-feed(EDAF 体制)期の文書は `docs/legacy/` にアーカイブ済み。参照しない
- コミットメッセージ・PR に Co-Authored-By 行を付けない

## 画面

`/dashboard`(概況)/ `/articles`(一覧・詳細)/ `/sources` / `/books`(D-25)/ `/subscribers`(+ `/[id]` でトークン発行・失効)/ `/viewers`(D-27)/ `/access-logs` / `/learning`(採点)・`/learning/items`(トラッカー)・`/learning/books`(book_review 対象の進行管理)。ナビ外に `/`・`/login`・`/terms`・`/privacy`。

**トークン発行ダイアログのガードは仕様(D-5)**: 購読 URL は発行時に一度だけ表示、Escape・背景クリックで閉じられない、閉じたら再取得不可(失効+再発行のみ)、失効は不可逆であることを UI で明示。閉じるときに React Query の mutation キャッシュを `reset()` して平文トークンを残さない。

**罪悪感 UI の禁止(Phase 3 §8.2)**: 期日超過の警告色・件数バッジ・ストリークを `/learning` に出さない。「今日は採点するものがありません」を正常系として気持ちよく表示する。
