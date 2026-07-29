# Cursor 引き継ぎメモ: 京ふれーず iOS アプリ化

## 目的

「京ふれーず ～洛中リアル・京ことば辞典～」のWeb版デザイン資産と辞書データを活かし、Expo / React Native ベースでiOSリリースまで進める。

App Store想定:

- Bundle ID: `com.kokokikaku.kyofreeze`
- 正式アプリ名案: `京ふれーず・洛中リアル京/ことば辞典`
- 収益化予定: Google AdMob、広告削除、追加カードパック

## リポジトリ

- GitHub: `mikan-koko/kyofreeze`
- ローカル作業場所: `C:\Users\chaha\Documents\Codex\kyofreeze-github`
- Expoアプリ本体: `mobile/`
- 現在のプレビューURL: `http://localhost:8082/`

## 現在入っている主な画面

- `辞典`
  - 129語の京ことばカード
  - ジャンル絞り込み
  - 2列の和札グリッド
  - カードタップで詳細カード表示
  - 直訳 / 意訳 / なんでそう言う？ / こんな場面で / はんなり度 / 関連語
- `洛中地図`
  - 元Web版ベースの概略地図
  - 地名・名所・街あるあるフレーズのピン
  - ピン選択で直訳・意訳・場面を表示
- `はんなり検定`
  - 京ことばクイズ
  - 正誤フィードバック
  - ことはちゃんの検定用ポーズ
- `iOS計画`
  - AdMob、広告削除、追加カードパック、App Store準備項目のメモ

## デザイン方針

- 和風モダン + ポップアート + マンガ調
- 元Web版のカード画像、背景画像、ことはちゃん画像をできる限りiOS側へ反映
- 札カードは元Web版に寄せて以下を採用:
  - 淡いピンクの札
  - 細いピンクの二重フレーム
  - 丸窓のイラスト
  - 左上の封印タグ: `礼` / `裏` / `注` など
  - 右上の縦ランク
  - 下部の `はんなり` + カテゴリ色ドット
  - 右下の共有ピル
- ヒーロー部分はフレーム内フレームを避け、影と淡い面で軽く見せる
- ことはちゃん画像は背景透過PNGを使用

## 重要ファイル

- `mobile/App.tsx`
  - 画面、UI、カード、地図、検定の中心実装
- `mobile/assets/data/terms.json`
  - 辞書データ
- `mobile/assets/illustrations/index.ts`
  - 各京ことばカード画像の `require` マップ
- `mobile/assets/characters/`
  - ことはちゃん画像
  - 現在アプリで使う透過版:
    - `kotoha-guide-map-pose-alpha.png`
    - `kotoha-quiz-cheer-pose-v2-alpha.png`
- `mobile/assets/hero/kyoto-town-pop.png`
  - 背景/ヒーロー系画像
- `mobile/assets/map/rakuchu-map-current-pop.png`
  - 洛中地図画像
- `scripts/verify-mobile-preview.mjs`
  - Expo WebをPlaywrightで撮影し、横はみ出しを監査
- `scripts/verify-kyofreeze-ui.mjs`
  - 元Web版のUI検証
- `dev-progress.html`
  - 開発進捗ボード
- `KYOFREEZE_IOS_RELEASE_PLAN.md`
  - iOSリリース計画

## よく使うコマンド

リポジトリ直下:

```powershell
cd C:\Users\chaha\Documents\Codex\kyofreeze-github
```

Expo Web起動:

```powershell
cd mobile
npm.cmd run web -- --port 8082
```

型チェック:

```powershell
cd mobile
npm.cmd exec tsc -- --noEmit
```

モバイル/タブレットのプレビュー検証:

```powershell
cd C:\Users\chaha\Documents\Codex\kyofreeze-github
npm.cmd run verify:mobile-preview
```

元Web版UI検証:

```powershell
npm.cmd run verify:ui
```

Git反映:

```powershell
git status --short
git add .
git commit -m "..."
git push
```

## 直近の主な変更

- ヒーローのフレーム内フレーム感を削減
- ことはちゃん画像を透過PNG化して差し替え
- 各札左側の太い色帯を非表示
- 札カードにホバー時の浮き・回転・影演出を追加
- 元Web版に近い札の封印タグ、縦ランク、はんなりドットを反映
- 地図と検定のことはちゃん背景を調整

## 検証済み状態

直近では以下を通している:

- `npm.cmd exec tsc -- --noEmit`
- `npm.cmd run verify:mobile-preview`
- `npm.cmd run verify:ui`

`verify:mobile-preview` は以下のスクリーンショットを出す:

- `outputs/mobile-preview/390x844-dict.png`
- `outputs/mobile-preview/390x844-dict-detail.png`
- `outputs/mobile-preview/390x844-map.png`
- `outputs/mobile-preview/390x844-quiz.png`
- `outputs/mobile-preview/390x844-roadmap.png`
- `outputs/mobile-preview/820x1180-*.png`

## 次に詰めるとよいこと

### 1. 実機確認

- Expo GoでiPhone実機確認
- 文字サイズ、下部タブ、安全領域、カード詳細のスクロール感を確認
- WebではOKでも、iOSネイティブで影や `hovered` が効かない点に注意

### 2. iOSネイティブ向け調整

- iPhoneではホバーがないため、カード押下時の `pressed` 演出を強める
- 共有ボタンを実際に `Share` APIへ接続
- 詳細カードを `Modal` 化するか、現状の絶対配置を維持するか検討
- 下部タブのSafe Area対応を確認

### 3. App Store素材

- App Store用スクリーンショット
- アプリアイコン最終版
- サポートURL
- プライバシーポリシーURL
- アプリ説明文
- キーワード

### 4. AdMob / 課金

- AdMobアプリID / 広告ユニットIDの準備
- 広告削除SKU案: `com.kokokikaku.kyofreeze.removeads`
- 追加カードパックSKU案: `com.kokokikaku.kyofreeze.cardpack.*`
- 購入復元導線
- 無料範囲と有料範囲の設計

### 5. EAS Build

- Expoアカウント確認
- `eas.json` 作成
- `app.json` / `app.config.*` のBundle ID確認
- iOSビルド
- TestFlight配布

## 注意点

- `mobile/assets/illustrations` は画像が多く、リポジトリサイズが大きい。今後のビルドサイズ最適化が必要。
- ことはちゃん画像は元画像と透過版が併存している。アプリ参照は `*-alpha.png`。
- `Pressable` の `hovered` はWebプレビュー向け。iOS実機では `pressed` を中心に調整する。
- 画像背景透過はローカル処理で作ったため、細かいエッジが気になる場合は画像生成または手作業で再調整。
- 既存の元Web版は `C:\Users\chaha\Documents\Codex\2026-07-13\c-users-chaha-appdata-roaming-claude\outputs\index.html` にある。

## Cursorで作業するときのおすすめ順

1. `mobile/App.tsx` を開き、画面構成とスタイルを把握
2. `npm.cmd run web -- --port 8082` でプレビュー
3. 実機確認前に `verify:mobile-preview` を通す
4. 共有、AdMob、IAP、EASの順にネイティブ機能を足す
5. iOS実機で崩れた箇所を小さく修正
6. TestFlightへ進む

