import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ILLUSTRATIONS } from "./assets/illustrations";
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
type CatFilter = keyof typeof CATS;

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
const HERO_TOWN = require("./assets/hero/kyoto-town-pop.png");
const APP_ICON = require("./assets/icon.png");
const RAKUCHU_MAP = require("./assets/map/rakuchu-map-current-pop.png");

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

const TAB_ITEMS: { id: ViewMode; label: string; mark: string }[] = [
  { id: "dict", label: "辞典", mark: "辞" },
  { id: "map", label: "洛中地図", mark: "図" },
  { id: "quiz", label: "検定", mark: "検" },
  { id: "roadmap", label: "iOS計画", mark: "計" },
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function findTerm(name: string) {
  return TERMS.find((term) => term.k === name || term.k.includes(name) || name.includes(term.k));
}

function illustrationFor(term?: Term | null) {
  if (!term) return null;
  return ILLUSTRATIONS[term.k as keyof typeof ILLUSTRATIONS] ?? null;
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
  const [selectedCat, setSelectedCat] = useState<CatFilter>("greet");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Term>(TERMS[0]);
  const [selectedSpot, setSelectedSpot] = useState<MapSpot>(MAP_SPOTS[6]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoped = q ? TERMS : TERMS.filter((term) => term.c === selectedCat);
    if (!q) return scoped;
    return scoped.filter((term) =>
      [term.k, term.y, term.choku, term.honne, term.why, term.scene].join(" ").toLowerCase().includes(q),
    );
  }, [query, selectedCat]);

  const mapTerms = selectedSpot.phrases.map((phrase) => findTerm(phrase)).filter(Boolean) as Term[];
  const quizTerm = TERMS[(quizIndex * 17) % TERMS.length];
  const quizField: "choku" | "honne" = quizIndex % 2 === 0 ? "honne" : "choku";
  const quizAnswer = stripHtml(quizTerm[quizField]);
  const options = buildOptions(quizTerm, quizField, quizIndex);
  const answered = answer !== null;
  const progress = Math.min(100, ((quizIndex % 10) + (answered ? 1 : 0)) * 10);
  const selectedArt = illustrationFor(selected);
  const quizArt = illustrationFor(quizTerm);
  const selectedCatMeta = CATS[selectedCat];

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
      <View style={styles.appBg}>
        <Image source={HERO_TOWN} style={styles.appBgPhoto} />
        <View style={styles.appVeil}>
          <View style={styles.header}>
            <View style={styles.headerMain}>
              <View style={styles.logoRow}>
                <Image source={APP_ICON} style={styles.headerIcon} />
                <View style={styles.logoText}>
                  <View style={styles.headerTitleRow}>
                    <Text style={styles.appName}>京ふれーず</Text>
                    <Text style={styles.headerMessage}>直訳と意訳で、京の空気をめくる</Text>
                  </View>
                  <Text style={styles.tagline}>RAKUCHU REAL</Text>
                </View>
              </View>
            </View>
            <Image source={GUIDE} style={styles.headerGuide} />
          </View>
          <View style={styles.headerStripe} />

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
                style={styles.termList}
                data={filtered}
                keyExtractor={(item) => item.k}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                  <View>
                    <ImageBackground source={HERO_TOWN} resizeMode="cover" imageStyle={styles.dictHeroImage} style={styles.dictHero}>
                      <View style={styles.dictHeroOverlay}>
                        <Text style={styles.dictHeroKicker}>RAKUCHU REAL</Text>
                        <Text style={styles.dictHeroTitle}>洛中リアル・京ことば辞典。</Text>
                        <Text style={styles.dictHeroText}>おおきに、ぶぶ漬け、よう言わんわ。直訳だけやのうて、言葉の奥にあるニュアンスまで。</Text>
                      </View>
                    </ImageBackground>
                    <View style={styles.catRail}>
                      {(Object.keys(CATS) as CatFilter[]).map((id) => {
                        const cat = CATS[id];
                        const active = selectedCat === id && !query.trim();
                        return (
                          <Pressable
                            key={id}
                            onPress={() => {
                              setSelectedCat(id);
                              setQuery("");
                              const first = TERMS.find((term) => term.c === id);
                              if (first) setSelected(first);
                            }}
                            style={[styles.catChip, active && styles.catChipActive, { borderColor: cat.color }]}
                          >
                            <Text style={[styles.catSeal, active && styles.catSealActive]}>{cat.seal}</Text>
                            <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{cat.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <View style={styles.sectionHead}>
                      <View>
                        <Text style={styles.sectionKicker}>SORTED BY</Text>
                        <Text style={styles.sectionTitle}>{query.trim() ? "検索結果" : selectedCatMeta.label}</Text>
                      </View>
                      <Text style={styles.sectionCount}>{filtered.length}語</Text>
                    </View>
                  </View>
                }
                renderItem={({ item }) => {
                  const cat = CATS[item.c];
                  const isSelected = selected.k === item.k;
                  const art = illustrationFor(item);
                  return (
                    <Pressable
                      onPress={() => setSelected(item)}
                      style={[styles.termCard, isSelected && styles.termCardActive, { borderColor: isSelected ? cat.color : "#26233A" }]}
                    >
                      <View style={styles.cornerTop} />
                      <View style={styles.cornerBottom} />
                      <View style={[styles.fudaBand, { backgroundColor: cat.color }]} />
                      {art && <Image source={art} style={styles.termThumb} />}
                      <View style={styles.termBody}>
                        <Text style={[styles.termCat, { color: cat.color }]}>{cat.label}</Text>
                        <Text style={styles.term}>{item.k}</Text>
                        <Text style={styles.yomi}>{item.y}</Text>
                        <View style={styles.rule} />
                        <Text style={styles.meaning} numberOfLines={2}>
                          {stripHtml(item.choku)}
                        </Text>
                        <View style={styles.beans}>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <View key={level} style={[styles.bean, item.h >= level && styles.beanOn]} />
                          ))}
                        </View>
                      </View>
                      <Text style={[styles.hannari, { color: cat.color }]}>Lv.{item.h}</Text>
                    </Pressable>
                  );
                }}
              />
              <View style={styles.detail}>
                <View style={styles.detailFuda}>
                  {selectedArt && <Image source={selectedArt} style={styles.detailArt} />}
                  <View style={[styles.detailSeal, { backgroundColor: CATS[selected.c].color }]}>
                    <Text style={styles.detailSealText}>{CATS[selected.c].seal}</Text>
                  </View>
                </View>
                <View style={styles.detailCopy}>
                  <Text style={styles.detailCat}>{CATS[selected.c].label}</Text>
                  <Text style={styles.detailTitle}>{selected.k}</Text>
                  <Text style={styles.detailYomi}>{selected.y}</Text>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>直訳</Text>
                    <Text style={styles.detailText}>{stripHtml(selected.choku)}</Text>
                  </View>
                  <View style={styles.detailBlockHonne}>
                    <Text style={styles.detailLabel}>意訳</Text>
                    <Text style={styles.detailText}>{stripHtml(selected.honne)}</Text>
                  </View>
                  <Text style={styles.sceneText}>{stripHtml(selected.scene)}</Text>
                </View>
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

          <ImageBackground source={RAKUCHU_MAP} resizeMode="cover" imageStyle={styles.mapBoardImage} style={styles.mapBoard}>
            <View style={styles.mapImageShade} />
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
          </ImageBackground>

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
          <ImageBackground source={HERO_TOWN} resizeMode="cover" imageStyle={styles.quizHeroBg} style={styles.quizHero}>
            <View style={styles.quizHeroVeil} />
            <View style={styles.quizHeroCopy}>
              <Text style={styles.quizBadge}>はんなり検定</Text>
              <Text style={styles.quizTitle}>第{(quizIndex % 10) + 1}問</Text>
              <Text style={styles.quizScore}>正解 {score} / 挑戦 {quizIndex}</Text>
            </View>
            <Image source={GUIDE} style={styles.quizGuide} />
          </ImageBackground>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.questionCard}>
            {quizArt && <Image source={quizArt} style={styles.questionArt} />}
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

          <View style={styles.bottomNav}>
            {TAB_ITEMS.map((item) => {
              const active = mode === item.id;
              return (
                <Pressable key={item.id} onPress={() => setMode(item.id)} style={[styles.navItem, active && styles.navItemActive]}>
                  <View style={[styles.navMark, active && styles.navMarkActive]}>
                    <Text style={[styles.navMarkText, active && styles.navMarkTextActive]}>{item.mark}</Text>
                  </View>
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF6EE" },
  appBg: { flex: 1, overflow: "hidden", position: "relative" },
  appBgPhoto: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.16,
    resizeMode: "cover",
  },
  appVeil: { flex: 1, backgroundColor: "rgba(250, 246, 238, 0.86)" },
  header: {
    minHeight: 92,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "rgba(255, 248, 232, 0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerMain: { flex: 1, paddingRight: 8 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: { width: 44, height: 44, borderRadius: 13, borderWidth: 2, borderColor: "#26233A" },
  logoText: { flex: 1 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  appName: { fontSize: 27, lineHeight: 32, fontWeight: "900", color: "#26233A", letterSpacing: 0.5 },
  tagline: { marginTop: 1, fontSize: 10, fontWeight: "900", color: "#F26D88", letterSpacing: 2.2 },
  headerMessage: {
    color: "#514754",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    flex: 1,
  },
  headerGuide: { width: 58, height: 78, resizeMode: "contain" },
  headerStripe: { height: 5, backgroundColor: "#F26D88", borderBottomWidth: 1, borderBottomColor: "#E7D3C3" },
  bottomNav: {
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
    backgroundColor: "rgba(255, 253, 248, 0.96)",
    borderTopWidth: 2,
    borderTopColor: "#E8DED4",
    shadowColor: "#26233A",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  navItemActive: { backgroundColor: "#26233A", borderColor: "#26233A" },
  navMark: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3D0",
    borderWidth: 1,
    borderColor: "#E8DED4",
  },
  navMarkActive: { backgroundColor: "#F26D88", borderColor: "#F26D88" },
  navMarkText: { color: "#26233A", fontSize: 12, fontWeight: "900" },
  navMarkTextActive: { color: "#FFFDF8" },
  navLabel: { color: "#655B50", fontSize: 11, fontWeight: "900" },
  navLabelActive: { color: "#FFFDF8" },
  screen: { flex: 1, paddingHorizontal: 14 },
  dictHero: {
    minHeight: 178,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#26233A",
    justifyContent: "flex-end",
  },
  dictHeroImage: { borderRadius: 21 },
  dictHeroOverlay: {
    minHeight: 178,
    padding: 18,
    justifyContent: "flex-end",
    backgroundColor: "rgba(255, 248, 232, 0.28)",
  },
  dictHeroKicker: { color: "#F26D88", fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  dictHeroTitle: { marginTop: 6, color: "#26233A", fontSize: 26, lineHeight: 33, fontWeight: "900" },
  dictHeroText: { marginTop: 8, color: "#3F3849", fontSize: 13, lineHeight: 20, fontWeight: "800" },
  search: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255,253,248,.92)",
    borderWidth: 2,
    borderColor: "#E8DED4",
    paddingHorizontal: 14,
    color: "#26233A",
    fontSize: 15,
    fontWeight: "700",
  },
  termList: { flex: 1 },
  list: { gap: 10, paddingVertical: 12 },
  catRail: { flexDirection: "row", flexWrap: "wrap", gap: 7, paddingVertical: 12 },
  catChip: {
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: "rgba(255,253,248,.88)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexGrow: 1,
    justifyContent: "center",
  },
  catChipActive: { backgroundColor: "#26233A", borderColor: "#26233A" },
  catSeal: { fontSize: 12, fontWeight: "900", color: "#26233A" },
  catSealActive: { color: "#FFFDF8" },
  catChipText: { fontSize: 12, fontWeight: "900", color: "#514754" },
  catChipTextActive: { color: "#FFFDF8" },
  sectionHead: {
    marginBottom: 2,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionKicker: { color: "#F26D88", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  sectionTitle: { marginTop: 2, color: "#26233A", fontSize: 20, fontWeight: "900" },
  sectionCount: {
    color: "#26233A",
    backgroundColor: "#FFF3D0",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900",
  },
  termCard: {
    flexDirection: "row",
    gap: 12,
    minHeight: 136,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,253,248,.94)",
    borderWidth: 2,
    borderColor: "#26233A",
    shadowColor: "#26233A",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    overflow: "hidden",
  },
  termCardActive: { backgroundColor: "#FFF4F7" },
  cornerTop: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 18,
    height: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#D9B43A",
  },
  cornerBottom: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 18,
    height: 18,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#D9B43A",
  },
  fudaBand: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  termThumb: {
    width: 88,
    height: 108,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#26233A",
    resizeMode: "cover",
    backgroundColor: "#F6E7CB",
  },
  seal: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sealText: { color: "#FFFFFF", fontWeight: "900" },
  termBody: { flex: 1 },
  termCat: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  term: { marginTop: 2, fontSize: 21, fontWeight: "900", color: "#26233A" },
  yomi: { marginTop: 2, fontSize: 11, fontWeight: "800", color: "#8A7D8D", letterSpacing: 1 },
  rule: { width: 54, height: 1, backgroundColor: "rgba(38,35,58,.26)", marginTop: 8, marginBottom: 6 },
  meaning: { color: "#514754", fontSize: 13, fontWeight: "800", lineHeight: 19 },
  beans: { flexDirection: "row", gap: 4, marginTop: 8 },
  bean: { width: 10, height: 10, borderRadius: 999, borderWidth: 1, borderColor: "#D8CFC7", backgroundColor: "#F3EBDD" },
  beanOn: { backgroundColor: "#26233A", borderColor: "#26233A" },
  hannari: { color: "#F26D88", fontWeight: "900" },
  detail: {
    marginBottom: 12,
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(255,253,248,.96)",
    borderWidth: 3,
    borderColor: "#26233A",
    flexDirection: "row",
    gap: 12,
    shadowColor: "#26233A",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
  },
  detailFuda: { width: 116, minHeight: 172, position: "relative" },
  detailArt: { width: 116, height: 172, borderRadius: 10, resizeMode: "cover", backgroundColor: "#F6E7CB" },
  detailSeal: {
    position: "absolute",
    left: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFDF8",
  },
  detailSealText: { color: "#FFFDF8", fontWeight: "900" },
  detailCopy: { flex: 1 },
  detailCat: { color: "#F26D88", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  detailTitle: { fontSize: 24, fontWeight: "900", color: "#26233A" },
  detailYomi: { marginTop: 1, color: "#8A7D8D", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  detailBlock: { marginTop: 10, borderRadius: 12, backgroundColor: "rgba(66,184,168,.12)", padding: 10 },
  detailBlockHonne: { marginTop: 8, borderRadius: 12, backgroundColor: "rgba(242,109,136,.10)", borderWidth: 1, borderColor: "rgba(242,109,136,.35)", padding: 10 },
  detailLabel: { fontSize: 11, fontWeight: "900", color: "#F26D88" },
  detailText: { marginTop: 4, color: "#514754", fontSize: 14, fontWeight: "700", lineHeight: 22 },
  sceneText: { marginTop: 8, color: "#8A7357", fontSize: 12, fontWeight: "800", lineHeight: 18 },
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
  mapBoardImage: { borderRadius: 21 },
  mapImageShade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255, 253, 248, 0.10)",
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
    borderRadius: 999,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#26233A",
    shadowOpacity: 0.28,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
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
  quizHeroBg: { borderRadius: 20 },
  quizHeroVeil: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255, 244, 247, 0.68)",
  },
  quizHeroCopy: { flex: 1, zIndex: 2 },
  quizBadge: { alignSelf: "flex-start", color: "#26233A", fontSize: 12, fontWeight: "900" },
  quizTitle: { marginTop: 8, fontSize: 44, lineHeight: 50, fontWeight: "900", color: "#F26D88" },
  quizScore: { marginTop: 8, color: "#335C81", fontWeight: "900" },
  quizGuide: { width: 142, height: 190, resizeMode: "contain", alignSelf: "flex-end", zIndex: 2 },
  progressTrack: { height: 14, borderRadius: 999, backgroundColor: "#E8DED4", overflow: "hidden", borderWidth: 2, borderColor: "#FFFFFF" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#42B8A8" },
  questionCard: { borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 3, borderColor: "#26233A", padding: 18 },
  questionArt: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#26233A",
    resizeMode: "cover",
    marginBottom: 14,
    backgroundColor: "#F6E7CB",
  },
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
