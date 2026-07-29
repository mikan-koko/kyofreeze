import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import termsJson from "./assets/data/terms.json";

const CATS = {
  greet: { label: "あいさつ", seal: "礼", color: "#42B8A8" },
  nuance: { label: "意訳表現", seal: "裏", color: "#F26D88" },
  trap: { label: "勘違い注意", seal: "注", color: "#F6A23A" },
  life: { label: "日々のことば", seal: "暮", color: "#A84E8A" },
  food: { label: "食べもの", seal: "膳", color: "#D9B43A" },
  place: { label: "地名・道案内", seal: "道", color: "#335C81" },
  local: { label: "街あるある", seal: "京", color: "#788A56" },
};

type Term = {
  k: string;
  y: string;
  c: keyof typeof CATS;
  e?: string;
  h: number;
  choku: string;
  honne: string;
  why: string;
  who?: string;
  scene: string;
  rel?: string[];
};

type ViewMode = "dict" | "map" | "quiz" | "roadmap";

type MapSpot = {
  id: string;
  name: string;
  kana: string;
  area: string;
  x: number;
  y: number;
  color: string;
  phrases: string[];
  note: string;
};

const TERMS = termsJson as Term[];
const GUIDE = require("./assets/characters/kyofreeze-guide-bold.png");

const MAP_SPOTS: MapSpot[] = [
  {
    id: "demachi",
    name: "出町柳",
    kana: "demachiyanagi",
    area: "北東",
    x: 61,
    y: 14,
    color: "#42B8A8",
    phrases: ["ふたばの豆餅もろた", "鴨川等間隔の法則"],
    note: "鴨川と学生街が近い、手土産と待ち合わせの気配が濃い場所。",
  },
  {
    id: "hyakumanben",
    name: "百万遍",
    kana: "hyakumanben",
    area: "左京",
    x: 72,
    y: 22,
    color: "#335C81",
    phrases: ["百万遍交差点xy軸", "ルネで昼飯"],
    note: "京大周辺の座標感覚と学生ことばが混ざる交差点。",
  },
  {
    id: "ichijoji",
    name: "一乗寺",
    kana: "ichijoji",
    area: "北東",
    x: 82,
    y: 10,
    color: "#F6A23A",
    phrases: ["一乗寺でラーメン食べて百万遍で飲も", "天一こってり"],
    note: "ラーメンの記憶で地図が動く、左京区らしい寄り道地点。",
  },
  {
    id: "gion",
    name: "祇園",
    kana: "gion",
    area: "東山",
    x: 70,
    y: 55,
    color: "#A84E8A",
    phrases: ["おこしやす", "おいでやす", "はんなり"],
    note: "観光の入口でもあり、言葉の丁寧さがもっとも目立つ界隈。",
  },
  {
    id: "pontocho",
    name: "先斗町",
    kana: "pontocho",
    area: "河原町",
    x: 57,
    y: 49,
    color: "#F26D88",
    phrases: ["先斗町でご飯はちょっと緊張する", "木屋町で朝まで飲む"],
    note: "細い路地、店の明かり、ちょっと背筋が伸びる夜のことば。",
  },
  {
    id: "nishiki",
    name: "錦市場",
    kana: "nishiki",
    area: "四条",
    x: 47,
    y: 52,
    color: "#D9B43A",
    phrases: ["錦市場はもうインバウンドの場所やな", "おこうこ", "おあげさん"],
    note: "食の京都と観光地化の実感が同時に出る通り。",
  },
  {
    id: "karasuma",
    name: "烏丸御池",
    kana: "karasuma-oike",
    area: "洛中",
    x: 42,
    y: 42,
    color: "#26233A",
    phrases: ["上がる / 下る / 西入る / 東入る", "丸竹夷"],
    note: "通り名と方角で会話が進む、洛中の座標の中心。",
  },
  {
    id: "saiin",
    name: "西院・大宮",
    kana: "saiin-omiya",
    area: "西",
    x: 24,
    y: 62,
    color: "#788A56",
    phrases: ["西院・大宮でせんべろ", "王将1号店行こ"],
    note: "安く飲む、濃いめに食べる。普段着の京都が出るエリア。",
  },
  {
    id: "kyoto-station",
    name: "京都駅",
    kana: "kyoto-station",
    area: "南",
    x: 47,
    y: 84,
    color: "#E35D3B",
    phrases: ["206系統は絶対混む", "地下鉄が高い", "カルネ買っといて"],
    note: "市バス、地下鉄、手土産。移動の愚痴と便利さが集まる玄関口。",
  },
];

const MONETIZATION_ITEMS = [
  {
    title: "Google AdMob",
    body: "初期版は辞典閲覧の邪魔になりにくい位置にバナー、検定の区切りで必要に応じて広告を検討。",
  },
  {
    title: "広告削除",
    body: "SKU案: com.kokokikaku.kyofreeze.removeads。購入復元ボタンと状態保存が必要。",
  },
  {
    title: "追加カードパック",
    body: "SKU案: com.kokokikaku.kyofreeze.cardpack.*。季節、観光、学生街などテーマ別に拡張しやすい形。",
  },
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function findTerm(name: string) {
  return TERMS.find((term) => term.k === name || term.k.includes(name) || name.includes(term.k));
}

function buildOptions(term: Term, field: "choku" | "honne", index: number) {
  const answer = stripHtml(term[field]);
  const stride = field === "honne" ? 7 : 11;
  const others = TERMS.map((_, offset) => TERMS[(index * stride + offset * 13) % TERMS.length])
    .filter((item) => item.k !== term.k && item.c === term.c)
    .concat(TERMS.filter((item) => item.k !== term.k))
    .map((item) => stripHtml(item[field]))
    .filter((item, itemIndex, list) => item && item !== answer && list.indexOf(item) === itemIndex)
    .slice(0, 3);

  return [answer, ...others].sort((a, b) => ((a.charCodeAt(0) || 0) + index) - ((b.charCodeAt(0) || 0) + index));
}

export default function App() {
  const [mode, setMode] = useState<ViewMode>("dict");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Term>(TERMS[0]);
  const [selectedSpot, setSelectedSpot] = useState<MapSpot>(MAP_SPOTS[6]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((term) =>
      [term.k, term.y, term.choku, term.honne, term.why, term.scene].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  const mapTerms = selectedSpot.phrases.map((phrase) => findTerm(phrase)).filter(Boolean) as Term[];
  const quizTerm = TERMS[(quizIndex * 17) % TERMS.length];
  const quizField: "choku" | "honne" = quizIndex % 2 === 0 ? "honne" : "choku";
  const quizAnswer = stripHtml(quizTerm[quizField]);
  const options = buildOptions(quizTerm, quizField, quizIndex);
  const answered = answer !== null;
  const progress = Math.min(100, ((quizIndex % 10) + (answered ? 1 : 0)) * 10);

  function chooseAnswer(value: string) {
    if (answered) return;
    setAnswer(value);
    if (value === quizAnswer) setScore((current) => current + 1);
  }

  function nextQuiz() {
    setQuizIndex((current) => current + 1);
    setAnswer(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.appName}>京ふれーず</Text>
          <Text style={styles.tagline}>洛中リアル京/ことば辞典</Text>
        </View>
        <Image source={GUIDE} style={styles.headerGuide} />
      </View>

      <View style={styles.tabs}>
        {[
          ["dict", "辞典"],
          ["map", "洛中地図"],
          ["quiz", "検定"],
          ["roadmap", "iOS計画"],
        ].map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setMode(id as ViewMode)}
            style={[styles.tab, mode === id && styles.tabActive]}
          >
            <Text style={[styles.tabText, mode === id && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === "dict" && (
        <View style={styles.screen}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="京ことばを検索"
            placeholderTextColor="#9B9284"
            style={styles.search}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.k}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const cat = CATS[item.c];
              const isSelected = selected.k === item.k;
              return (
                <Pressable
                  onPress={() => setSelected(item)}
                  style={[styles.termCard, isSelected && styles.termCardActive, { borderLeftColor: cat.color }]}
                >
                  <View style={[styles.seal, { backgroundColor: cat.color }]}>
                    <Text style={styles.sealText}>{cat.seal}</Text>
                  </View>
                  <View style={styles.termBody}>
                    <Text style={styles.term}>{item.k}</Text>
                    <Text style={styles.yomi}>{item.y}</Text>
                    <Text style={styles.meaning} numberOfLines={2}>
                      {stripHtml(item.choku)}
                    </Text>
                  </View>
                  <Text style={styles.hannari}>Lv.{item.h}</Text>
                </Pressable>
              );
            }}
          />
          <View style={styles.detail}>
            <Text style={styles.detailTitle}>{selected.k}</Text>
            <Text style={styles.detailLabel}>直訳</Text>
            <Text style={styles.detailText}>{stripHtml(selected.choku)}</Text>
            <Text style={styles.detailLabel}>意訳</Text>
            <Text style={styles.detailText}>{stripHtml(selected.honne)}</Text>
          </View>
        </View>
      )}

      {mode === "map" && (
        <ScrollView contentContainerStyle={styles.mapScreen}>
          <View style={styles.mapHero}>
            <View style={styles.mapHeroCopy}>
              <Text style={styles.mapEyebrow}>洛中リアル地図</Text>
              <Text style={styles.mapTitle}>地名から京ことばをひらく</Text>
            </View>
            <Image source={GUIDE} style={styles.mapGuide} />
          </View>

          <View style={styles.mapBoard}>
            <View style={styles.mapRiver} />
            <View style={styles.mapRoadVertical} />
            <View style={styles.mapRoadHorizontal} />
            <Text style={[styles.mapRoadLabel, styles.mapRoadNorth]}>今出川</Text>
            <Text style={[styles.mapRoadLabel, styles.mapRoadCenter]}>四条</Text>
            <Text style={[styles.mapRoadLabel, styles.mapRoadSouth]}>京都駅</Text>
            <Text style={[styles.mapRoadLabel, styles.mapRoadWest]}>烏丸</Text>
            <Text style={[styles.mapRoadLabel, styles.mapRoadEast]}>河原町</Text>
            {MAP_SPOTS.map((spot) => {
              const active = selectedSpot.id === spot.id;
              return (
                <Pressable
                  key={spot.id}
                  onPress={() => setSelectedSpot(spot)}
                  style={[
                    styles.mapPin,
                    {
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      backgroundColor: active ? spot.color : "#FFFDF8",
                      borderColor: spot.color,
                    },
                  ]}
                >
                  <Text style={[styles.mapPinText, active && styles.mapPinTextActive]}>{spot.area}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.spotCard}>
            <View style={styles.spotHeader}>
              <View>
                <Text style={styles.spotArea}>{selectedSpot.area}</Text>
                <Text style={styles.spotName}>{selectedSpot.name}</Text>
                <Text style={styles.spotKana}>{selectedSpot.kana}</Text>
              </View>
              <View style={[styles.spotBadge, { backgroundColor: selectedSpot.color }]}>
                <Text style={styles.spotBadgeText}>現</Text>
              </View>
            </View>
            <Text style={styles.spotNote}>{selectedSpot.note}</Text>
            <View style={styles.phraseRail}>
              {selectedSpot.phrases.map((phrase) => (
                <Pressable
                  key={phrase}
                  style={styles.phraseChip}
                  onPress={() => {
                    const term = findTerm(phrase);
                    if (term) {
                      setSelected(term);
                      setMode("dict");
                    }
                  }}
                >
                  <Text style={styles.phraseChipText}>{phrase}</Text>
                </Pressable>
              ))}
            </View>
            {mapTerms.map((term) => (
              <View key={term.k} style={styles.mapTerm}>
                <Text style={styles.mapTermTitle}>{term.k}</Text>
                <Text style={styles.mapTermText}>{stripHtml(term.honne || term.choku)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {mode === "quiz" && (
        <ScrollView contentContainerStyle={styles.quizScreen}>
          <View style={styles.quizHero}>
            <View style={styles.quizHeroCopy}>
              <Text style={styles.quizBadge}>はんなり検定</Text>
              <Text style={styles.quizTitle}>第{(quizIndex % 10) + 1}問</Text>
              <Text style={styles.quizScore}>正解 {score} / 挑戦 {quizIndex}</Text>
            </View>
            <Image source={GUIDE} style={styles.quizGuide} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionKind}>{CATS[quizTerm.c].label}</Text>
            <Text style={styles.questionTerm}>{quizTerm.k}</Text>
            <Text style={styles.questionScene}>{stripHtml(quizTerm.scene)}</Text>
            <Text style={styles.questionText}>
              この京ことばの{quizField === "honne" ? "意訳" : "直訳"}はどれ？
            </Text>
            {options.map((option) => {
              const correct = answered && option === quizAnswer;
              const wrong = answered && option === answer && option !== quizAnswer;
              return (
                <Pressable
                  key={option}
                  onPress={() => chooseAnswer(option)}
                  style={[styles.option, correct && styles.optionCorrect, wrong && styles.optionWrong]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })}
            <View style={styles.feedback}>
              <Text style={styles.feedbackLabel}>{answered ? (answer === quizAnswer ? "正解" : "惜しい") : "ことはメモ"}</Text>
              <Text style={styles.feedbackText}>
                {answered ? stripHtml(quizTerm.why) : "答えると、ことばのニュアンスが出ます。"}
              </Text>
            </View>
            <Pressable
              onPress={answered ? nextQuiz : undefined}
              style={[styles.primaryButton, !answered && styles.primaryButtonMuted]}
            >
              <Text style={styles.primaryButtonText}>{answered ? "次の問題へ" : "回答を選んでください"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {mode === "roadmap" && (
        <ScrollView contentContainerStyle={styles.roadmap}>
          <Text style={styles.roadTitle}>iOS版の現在地</Text>
          <Text style={styles.roadCopy}>
            Bundle IDは com.kokokikaku.kyofreeze。辞書、洛中地図、はんなり検定の初期ネイティブ画面まで入りました。
          </Text>
          {MONETIZATION_ITEMS.map((item) => (
            <View key={item.title} style={styles.revenueCard}>
              <Text style={styles.revenueTitle}>{item.title}</Text>
              <Text style={styles.revenueText}>{item.body}</Text>
            </View>
          ))}
          <Text style={styles.roadItem}>次: App Store用サポートURLとプライバシーポリシーURL確定</Text>
          <Text style={styles.roadItem}>次: Expo Go / EAS Buildで実機確認</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF6EE" },
  header: {
    minHeight: 132,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFF7E8",
    borderBottomWidth: 3,
    borderBottomColor: "#F26D88",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: { flex: 1, paddingRight: 12 },
  appName: { fontSize: 31, fontWeight: "900", color: "#26233A", letterSpacing: 1 },
  tagline: { marginTop: 5, fontSize: 13, fontWeight: "800", color: "#F26D88", letterSpacing: 1.2 },
  headerGuide: { width: 94, height: 116, resizeMode: "contain" },
  tabs: { flexDirection: "row", gap: 6, padding: 12, backgroundColor: "#FAF6EE" },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E6DED3",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: "#26233A", borderColor: "#26233A" },
  tabText: { fontSize: 12, fontWeight: "900", color: "#655B50" },
  tabTextActive: { color: "#FFFDF8" },
  screen: { flex: 1, paddingHorizontal: 14 },
  search: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8DED4",
    paddingHorizontal: 14,
    color: "#26233A",
    fontSize: 15,
    fontWeight: "700",
  },
  list: { gap: 10, paddingVertical: 12 },
  termCard: {
    flexDirection: "row",
    gap: 12,
    minHeight: 96,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EEE3D8",
    borderLeftWidth: 7,
  },
  termCardActive: { borderColor: "#F26D88", backgroundColor: "#FFF4F7" },
  seal: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sealText: { color: "#FFFFFF", fontWeight: "900" },
  termBody: { flex: 1 },
  term: { fontSize: 20, fontWeight: "900", color: "#26233A" },
  yomi: { marginTop: 2, fontSize: 11, fontWeight: "800", color: "#8A7D8D", letterSpacing: 1 },
  meaning: { marginTop: 7, color: "#514754", fontSize: 13, fontWeight: "700", lineHeight: 19 },
  hannari: { color: "#F26D88", fontWeight: "900" },
  detail: {
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#FFFDF8",
    borderWidth: 2,
    borderColor: "#E5DACE",
  },
  detailTitle: { fontSize: 24, fontWeight: "900", color: "#26233A" },
  detailLabel: { marginTop: 12, fontSize: 12, fontWeight: "900", color: "#F26D88" },
  detailText: { marginTop: 4, color: "#514754", fontSize: 14, fontWeight: "700", lineHeight: 22 },
  mapScreen: { padding: 16, gap: 14 },
  mapHero: {
    minHeight: 154,
    borderRadius: 24,
    backgroundColor: "#E9FAF6",
    borderWidth: 2,
    borderColor: "#B9E7DF",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  mapHeroCopy: { flex: 1, paddingRight: 8 },
  mapEyebrow: { color: "#335C81", fontSize: 12, fontWeight: "900" },
  mapTitle: { marginTop: 8, color: "#26233A", fontSize: 24, lineHeight: 31, fontWeight: "900" },
  mapGuide: { width: 82, height: 126, resizeMode: "contain" },
  mapBoard: {
    height: 330,
    borderRadius: 24,
    backgroundColor: "#FFFDF8",
    borderWidth: 3,
    borderColor: "#26233A",
    overflow: "hidden",
  },
  mapRiver: {
    position: "absolute",
    right: "22%",
    top: -20,
    width: 28,
    height: 390,
    backgroundColor: "#C8EEF6",
    transform: [{ rotate: "7deg" }],
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#87CAD8",
  },
  mapRoadVertical: {
    position: "absolute",
    left: "43%",
    top: 0,
    width: 8,
    height: "100%",
    backgroundColor: "#F1D7A7",
  },
  mapRoadHorizontal: {
    position: "absolute",
    left: 0,
    top: "51%",
    width: "100%",
    height: 8,
    backgroundColor: "#F1D7A7",
  },
  mapRoadLabel: {
    position: "absolute",
    color: "#8A7357",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "#FFF7E8",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  mapRoadNorth: { left: 18, top: 62 },
  mapRoadCenter: { left: 18, top: "52%" },
  mapRoadSouth: { left: 18, bottom: 24 },
  mapRoadWest: { left: "35%", top: 18 },
  mapRoadEast: { right: "18%", top: 18 },
  mapPin: {
    position: "absolute",
    width: 48,
    minHeight: 38,
    marginLeft: -24,
    marginTop: -19,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#26233A",
    shadowOpacity: 0.18,
    shadowRadius: 7,
  },
  mapPinText: { color: "#26233A", fontSize: 11, fontWeight: "900" },
  mapPinTextActive: { color: "#FFFFFF" },
  spotCard: { borderRadius: 24, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#E4DAD0", padding: 18 },
  spotHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  spotArea: { color: "#F26D88", fontSize: 12, fontWeight: "900" },
  spotName: { marginTop: 4, color: "#26233A", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  spotKana: { marginTop: 2, color: "#8A7D8D", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  spotBadge: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  spotBadgeText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  spotNote: { marginTop: 12, color: "#514754", fontSize: 14, fontWeight: "700", lineHeight: 22 },
  phraseRail: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  phraseChip: { borderRadius: 999, backgroundColor: "#FFF4F7", borderWidth: 2, borderColor: "#F4C9D4", padding: 10 },
  phraseChipText: { color: "#A33652", fontSize: 12, fontWeight: "900" },
  mapTerm: { marginTop: 12, borderRadius: 16, backgroundColor: "#FAF6EE", padding: 13 },
  mapTermTitle: { color: "#26233A", fontSize: 16, fontWeight: "900" },
  mapTermText: { marginTop: 5, color: "#514754", fontSize: 13, fontWeight: "700", lineHeight: 20 },
  quizScreen: { padding: 16, gap: 14 },
  quizHero: {
    minHeight: 190,
    borderRadius: 22,
    backgroundColor: "#FFF4F7",
    borderWidth: 2,
    borderColor: "#EAD8D9",
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  quizHeroCopy: { flex: 1 },
  quizBadge: { alignSelf: "flex-start", color: "#26233A", fontSize: 12, fontWeight: "900" },
  quizTitle: { marginTop: 8, fontSize: 44, lineHeight: 50, fontWeight: "900", color: "#F26D88" },
  quizScore: { marginTop: 8, color: "#335C81", fontWeight: "900" },
  quizGuide: { width: 142, height: 190, resizeMode: "contain", alignSelf: "flex-end" },
  progressTrack: { height: 14, borderRadius: 999, backgroundColor: "#E8DED4", overflow: "hidden", borderWidth: 2, borderColor: "#FFFFFF" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#42B8A8" },
  questionCard: { borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#E4DAD0", padding: 18 },
  questionKind: { color: "#F26D88", fontSize: 12, fontWeight: "900" },
  questionTerm: { marginTop: 8, color: "#26233A", fontSize: 32, fontWeight: "900", lineHeight: 40 },
  questionScene: { marginTop: 6, color: "#8A7357", fontSize: 13, fontWeight: "800", lineHeight: 20 },
  questionText: { marginTop: 10, color: "#514754", fontSize: 14, fontWeight: "800" },
  option: {
    marginTop: 10,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DED8D2",
    padding: 13,
    justifyContent: "center",
  },
  optionCorrect: { borderColor: "#42B8A8", backgroundColor: "#E9FAF6" },
  optionWrong: { borderColor: "#F26D88", backgroundColor: "#FFF0F4" },
  optionText: { color: "#2F2A37", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  feedback: { marginTop: 14, borderRadius: 16, backgroundColor: "#FAF6EE", padding: 13 },
  feedbackLabel: { color: "#F26D88", fontSize: 12, fontWeight: "900", marginBottom: 4 },
  feedbackText: { color: "#514754", fontSize: 13, fontWeight: "700", lineHeight: 20 },
  primaryButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#F26D88",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  primaryButtonMuted: { backgroundColor: "#BDB4B2" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  roadmap: { padding: 20, gap: 12 },
  roadTitle: { fontSize: 30, fontWeight: "900", color: "#26233A" },
  roadCopy: { color: "#514754", fontSize: 15, fontWeight: "700", lineHeight: 24 },
  revenueCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E4DAD0",
    padding: 15,
  },
  revenueTitle: { color: "#26233A", fontSize: 18, fontWeight: "900" },
  revenueText: { marginTop: 6, color: "#514754", fontSize: 14, fontWeight: "700", lineHeight: 22 },
  roadItem: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E4DAD0",
    padding: 14,
    color: "#26233A",
    fontWeight: "900",
  },
});
