# 京ふれーず iOSリリース進行メモ

このメモは `iOSアプリ_リリース引き継ぎプレイブック.md` を京ふれーず向けに差し替えた初期計画です。

## 現在地

- Web版は `outputs/index.html` の静的アプリ。
- 129語、7ジャンル、カード画像、トップキャラ、洛中地図を実装済み。
- GitHub管理用チェックアウトは `C:\Users\chaha\Documents\Codex\kyofreeze-github`。
- GitHub Pages公開候補は `https://mikan-koko.github.io/kyofreeze/`。

## Phase 0 決めること

| 項目 | 京ふれーず案 | 確定 |
|---|---|---|
| アプリ名 | 京ふれーず | 未 |
| サブタイトル | 洛中リアル・京ことば辞典 | 未 |
| Bundle ID | `com.kokokikaku.kyofreeze` または `com.mikankoko.kyofreeze` | 未 |
| Expo account | `mikan-koko` | 未 |
| Expo project | `kyofreeze` | 未 |
| Web origin | `https://mikan-koko.github.io/kyofreeze` | 仮 |
| 収益化 | AdMob + 広告削除IAP + Web AdSense | 要判断 |
| IAP SKU案 | `com.kokokikaku.kyofreeze.removeads` | 未 |
| 課金保存キー案 | `kyofreeze.adsremoved.v1` | 未 |

## Phase 1 Web側の土台

- [x] OGP、アイコン、Apple touch icon
- [x] `manifest.json`
- [x] `privacy.html`
- [x] `robots.txt`
- [x] `sitemap.xml`
- [ ] 公開URLを確定して、`robots.txt` と `sitemap.xml` のURLを最終値へ差し替え
- [ ] App Store用サポートURL、マーケティングURLを決める
- [ ] 広告を入れる場合は、プライバシーポリシーへAdMob/AdSenseの説明を追記
- [ ] AdSenseを使う場合は `ads.txt` とCSP方針を決める

## Phase 2 iOS化方針

第一候補は Expo/EAS。

- Web版資産を活かすなら、初期版はExpo + WebViewまたはハイブリッド構成。
- App Store品質まで上げるなら、カード一覧、検索、詳細モーダル、地図ビューをSwiftUI/React Native画面として再構成する。
- 画像資産は `assets/illustrations`、`assets/icons`、`assets/characters`、`assets/map` を転用する。
- データは現在 `index.html` 内の `D` 配列にあるため、iOS化前に `terms.json` へ分離するのが望ましい。

## Phase A 先に進める事務

- [ ] Apple Developer Programの状態確認
- [ ] Paid Apps Agreementの有効状態確認
- [ ] 銀行口座登録
- [ ] W-8BEN提出
- [ ] App Store Connectで新規App枠作成

## App Store素材メモ

### 説明文たたき台

京ふれーずは、京都の方言・京ことばを「直訳」と「意訳」で楽しむ辞典アプリです。  
おおきに、ぶぶ漬け、よう言わんわ。言葉の表面だけでなく、奥にあるニュアンスや街の空気まで、和ポップなカードとイラストで読み解けます。

### キーワード案

京都,京ことば,方言,辞典,京都弁,観光,言葉,ローカル,文化,学習

### カテゴリ案

- 辞書/辞典
- 教育 または ライフスタイル

## 次の実作業候補

1. `terms.json` へのデータ分離
2. `privacy.html` の問い合わせ先と公開URL確定
3. Expoプロジェクト作成
4. アイコン、スプラッシュ、App Storeスクショの制作
5. AdMob/IAPを入れるかどうかの判断
