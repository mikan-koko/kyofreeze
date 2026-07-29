# 京ふれーず Mobile

Expo/React Native版の初期実装です。

## 現在できること

- `assets/data/terms.json` から129語の辞書データを読み込み
- 辞典リスト、検索、選択語の直訳/意訳表示
- はんなり検定の初期クイズ画面
- iOS Bundle ID: `com.kokokikaku.kyofreeze`
- アプリアイコンと案内役「ことは」画像の利用

## 開発コマンド

```bash
npm install
npm run ios
```

Windows上ではiOSシミュレータを直接起動できないため、実機のExpo Go、またはEAS Buildで確認します。

## 次にやること

- 洛中地図のネイティブ画面化
- App Storeスクリーンショット用の画面調整
- Google AdMob設計
- 広告削除IAPと追加カードパックIAPの設計
