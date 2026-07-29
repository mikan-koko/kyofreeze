# 京ふれーず Mobile

Expo/React Native版の初期実装です。

## 現在できること

- `assets/data/terms.json` から129語の辞書データを読み込み
- 辞典リスト、検索、選択語の直訳/意訳表示
- Web版の代表イラスト、町並み背景、洛中地図画像を使った和ポップUI
- 洛中地図の初期ネイティブ画面
- はんなり検定のクイズ画面
- iOS計画タブでAdMob/IAPの実装メモ表示
- iOS Bundle ID: `com.kokokikaku.kyofreeze`
- アプリアイコンと案内役「ことは」画像の利用

## 開発コマンド

```bash
npm install
npm run ios
```

Windows上ではiOSシミュレータを直接起動できないため、実機のExpo Go、またはEAS Buildで確認します。

## 次にやること

- App Storeスクリーンショット用の画面調整
- すべての辞典カード画像をiOS版に含めるか、軽量な追加ダウンロード方式にするか決定
- Google AdMob実装前のID整理
- 広告削除IAPと追加カードパックIAPの実装方式決定
- Expo Go / EAS Buildで実機確認
