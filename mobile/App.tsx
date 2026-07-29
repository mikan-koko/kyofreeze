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
  h: number;
  choku: string;
  honne: string;
  why: string;
  scene: string;
};

type ViewMode = "dict" | "quiz" | "roadmap";

const TERMS = termsJson as Term[];
const GUIDE = require("./assets/characters/kyofreeze-guide-bold.png");

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function buildOptions(term: Term, field: "choku" | "honne", index: number) {
  const answer = stripHtml(term[field]);
  const others = TERMS.filter((item) => item.k !== term.k)
    .slice(index + 3, index + 18)
    .map((item) => stripHtml(item[field]))
    .filter((item, itemIndex, list) => item && item !== answer && list.indexOf(item) === itemIndex)
    .slice(0, 3);

  return [answer, ...others].sort((a, b) => ((a.length + index) % 5) - ((b.length + index) % 5));
}

export default function App() {
  const [mode, setMode] = useState<ViewMode>("dict");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Term>(TERMS[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((term) =>
      [term.k, term.y, term.choku, term.honne, term.why].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  const quizTerm = TERMS[(quizIndex * 17) % TERMS.length];
  const quizField: "choku" | "honne" = quizIndex % 2 === 0 ? "honne" : "choku";
  const quizAnswer = stripHtml(quizTerm[quizField]);
  const options = buildOptions(quizTerm, quizField, quizIndex);
  const answered = answer !== null;

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
        <View>
          <Text style={styles.appName}>京ふれーず</Text>
          <Text style={styles.tagline}>洛中リアル京/ことば辞典</Text>
        </View>
        <Image source={GUIDE} style={styles.headerGuide} />
      </View>

      <View style={styles.tabs}>
        {[
          ["dict", "辞典"],
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

      {mode === "quiz" && (
        <ScrollView contentContainerStyle={styles.quizScreen}>
          <View style={styles.quizHero}>
            <View>
              <Text style={styles.quizBadge}>はんなり検定</Text>
              <Text style={styles.quizTitle}>第{(quizIndex % 5) + 1}問</Text>
              <Text style={styles.quizScore}>正解 {score}</Text>
            </View>
            <Image source={GUIDE} style={styles.quizGuide} />
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionKind}>{CATS[quizTerm.c].label}</Text>
            <Text style={styles.questionTerm}>{quizTerm.k}</Text>
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
            Bundle IDは com.kokokikaku.kyofreeze。辞書データはterms.jsonから読み込み済みです。
          </Text>
          <Text style={styles.roadItem}>次: 洛中地図のネイティブ表示</Text>
          <Text style={styles.roadItem}>次: AdMobの設計</Text>
          <Text style={styles.roadItem}>次: 広告削除とカードパック課金</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF6EE" },
  header: {
    minHeight: 136,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#FFF7E8",
    borderBottomWidth: 3,
    borderBottomColor: "#F26D88",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appName: { fontSize: 32, fontWeight: "900", color: "#26233A", letterSpacing: 1 },
  tagline: { marginTop: 5, fontSize: 13, fontWeight: "800", color: "#F26D88", letterSpacing: 1.5 },
  headerGuide: { width: 104, height: 124, resizeMode: "contain" },
  tabs: { flexDirection: "row", gap: 8, padding: 14, backgroundColor: "#FAF6EE" },
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
  tabText: { fontSize: 13, fontWeight: "900", color: "#655B50" },
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
  quizBadge: { alignSelf: "flex-start", color: "#26233A", fontSize: 12, fontWeight: "900" },
  quizTitle: { marginTop: 8, fontSize: 44, lineHeight: 50, fontWeight: "900", color: "#F26D88" },
  quizScore: { marginTop: 8, color: "#335C81", fontWeight: "900" },
  quizGuide: { width: 150, height: 190, resizeMode: "contain", alignSelf: "flex-end" },
  questionCard: { borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 2, borderColor: "#E4DAD0", padding: 18 },
  questionKind: { color: "#F26D88", fontSize: 12, fontWeight: "900" },
  questionTerm: { marginTop: 8, color: "#26233A", fontSize: 32, fontWeight: "900", lineHeight: 40 },
  questionText: { marginTop: 8, color: "#514754", fontSize: 14, fontWeight: "800" },
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
