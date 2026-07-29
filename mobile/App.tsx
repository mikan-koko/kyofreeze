import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
  termKey: string;
  x: number;
  y: number;
  color: string;
  note: string;
};

const TERMS = termsJson as Term[];
const GUIDE = require("./assets/characters/kyofreeze-guide-bold.png");
const GUIDE_MAP = require("./assets/characters/kotoha-guide-map-pose-alpha.png");
const GUIDE_QUIZ = require("./assets/characters/kotoha-quiz-cheer-pose-v2-alpha.png");
const HERO_TOWN = require("./assets/hero/kyoto-town-pop.png");
const APP_ICON = require("./assets/icon.png");
const RAKUCHU_MAP = require("./assets/map/rakuchu-map-current-pop.png");
const HANNARI = {
  1: "おぶう一杯レベル",
  2: "町内会レベル",
  3: "四条通すいすいレベル",
  4: "先斗町の常連レベル",
  5: "祇園の女将レベル",
} as const;

const MAP_SPOTS: MapSpot[] = [
  { id: "marutake", termKey: "丸竹夷", x: 43, y: 24, color: "#42B8A8", note: "御所の南側へ広がる東西の通りを覚える、洛中の地図感覚そのもの。" },
  { id: "teragoko", termKey: "寺御幸", x: 57, y: 27, color: "#335C81", note: "河原町より西の南北通りをたどる時の、昔ながらの道しるべ。" },
  { id: "agaru", termKey: "上がる", x: 49, y: 39, color: "#F6A23A", note: "北へ行く、という京都式の方角表現。碁盤目の街で生きる言い方です。" },
  { id: "pontocho", termKey: "先斗町", x: 79, y: 48, color: "#F26D88", note: "鴨川のすぐ西側、細い路地と花街らしい少し背筋が伸びる場所。" },
  { id: "kiyamachi", termKey: "木屋町", x: 76, y: 53, color: "#A84E8A", note: "鴨川に寄り添う高瀬川沿いの夜の空気まで含めて覚えたい地名。" },
  { id: "uradera", termKey: "裏寺", x: 66, y: 55, color: "#788A56", note: "河原町近くの買い物や寄り道の記憶と結びつく路地感。" },
  { id: "nishiki", termKey: "錦市場はもうインバウンドの場所やな", x: 60, y: 58, color: "#D9B43A", note: "四条河原町に近い市場の変化を、地元目線でさらっと言うフレーズ。" },
  { id: "kamogawa", termKey: "鴨川等間隔の法則", x: 86, y: 59, color: "#42B8A8", note: "川べりの距離感まで京都の景色になる定番ミーム。" },
  { id: "shijo", termKey: "四条通が渋滞で進まへん", x: 57, y: 63, color: "#E35D3B", note: "四条通の洛中移動あるある。歩いたほうが早い日もあります。" },
  { id: "ohsho", termKey: "王将1号店行こ", x: 48, y: 67, color: "#26233A", note: "四条大宮の聖地巡礼として語られる、街のローカルフレーズ。" },
  { id: "nishiiru", termKey: "西入る", x: 36, y: 56, color: "#335C81", note: "通り名と組み合わせると急に京都の住所っぽくなる言い方。" },
  { id: "higashiiru", termKey: "東入る", x: 69, y: 56, color: "#335C81", note: "東西南北を街の碁盤目でつかむための言い方。" },
  { id: "sagaru", termKey: "下る", x: 49, y: 74, color: "#F6A23A", note: "南へ行く、という京都式の方角表現。駅方面へ下がる感覚にもつながります。" },
  { id: "takabashi", termKey: "たかばし", x: 57, y: 86, color: "#A84E8A", note: "京都駅の東寄りで語られる、第一旭と新福菜館のラーメン派閥。" },
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

function termForSpot(spot: MapSpot) {
  return findTerm(spot.termKey) ?? TERMS[0];
}

function illustrationFor(term?: Term | null) {
  if (!term) return null;
  return ILLUSTRATIONS[term.k as keyof typeof ILLUSTRATIONS] ?? null;
}

function shortMapLabel(value: string) {
  return value.length > 8 ? `${value.slice(0, 7)}…` : value;
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
  const [detailOpen, setDetailOpen] = useState(false);
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

  const mapTerm = termForSpot(selectedSpot);
  const quizTerm = TERMS[(quizIndex * 17) % TERMS.length];
  const quizField: "choku" | "honne" = quizIndex % 2 === 0 ? "honne" : "choku";
  const quizAnswer = stripHtml(quizTerm[quizField]);
  const options = buildOptions(quizTerm, quizField, quizIndex);
  const answered = answer !== null;
  const progress = Math.min(100, ((quizIndex % 10) + (answered ? 1 : 0)) * 10);
  const selectedArt = illustrationFor(selected);
  const mapArt = illustrationFor(mapTerm);
  const quizArt = illustrationFor(quizTerm);
  const selectedCatMeta = CATS[selectedCat];
  const heroFloat = useRef(new Animated.Value(0)).current;
  const mapFloat = useRef(new Animated.Value(0)).current;
  const quizFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const heroLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(heroFloat, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const mapLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mapFloat, { toValue: 1, duration: 2300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(mapFloat, { toValue: 0, duration: 2300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const quizLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(quizFloat, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }),
        Animated.timing(quizFloat, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    heroLoop.start();
    mapLoop.start();
    quizLoop.start();
    return () => {
      heroLoop.stop();
      mapLoop.stop();
      quizLoop.stop();
    };
  }, [heroFloat, mapFloat, quizFloat]);

  const heroFloatStyle = {
    transform: [
      {
        translateY: heroFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }),
      },
      {
        rotate: heroFloat.interpolate({ inputRange: [0, 1], outputRange: ["-1.5deg", "1.5deg"] }),
      },
    ],
  };
  const mapFloatStyle = {
    transform: [
      {
        translateX: mapFloat.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }),
      },
      {
        rotate: mapFloat.interpolate({ inputRange: [0, 1], outputRange: ["1deg", "-2deg"] }),
      },
    ],
  };
  const quizFloatStyle = {
    transform: [
      {
        translateY: quizFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -11] }),
      },
      {
        scale: quizFloat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
      },
    ],
  };

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
        <View style={styles.pastelWashMint} />
        <View style={styles.pastelWashPink} />
        <View style={styles.pastelWashCream} />
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
                      <View style={styles.dictHeroShade} />
                      <View style={styles.dictHeroOverlay}>
                        <View style={styles.dictHeroCopy}>
                          <Text style={styles.dictHeroKicker}>RAKUCHU REAL</Text>
                          <Text style={styles.dictHeroTitle}>洛中リアル・京ことば辞典。</Text>
                          <Text style={styles.dictHeroText}>おおきに、ぶぶ漬け、よう言わんわ。直訳だけやのうて、言葉の奥にあるニュアンスまで。</Text>
                        </View>
                        <View style={styles.heroGuideWrap}>
                          <Animated.Image source={GUIDE} style={[styles.heroGuide, heroFloatStyle]} />
                          <View style={styles.guideName}>
                            <Text style={styles.guideRole}>案内役</Text>
                            <Text style={styles.guideText}>ことは</Text>
                          </View>
                        </View>
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
                              setDetailOpen(false);
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
                renderItem={({ item, index }) => {
                  const cat = CATS[item.c];
                  const isSelected = selected.k === item.k;
                  const art = illustrationFor(item);
                  const baseRotate = index % 4 === 0 ? "-0.55deg" : index % 4 === 1 ? "0.45deg" : index % 4 === 2 ? "-0.25deg" : "0.65deg";
                  return (
                    <Pressable
                      onPress={() => {
                        setSelected(item);
                        setDetailOpen(true);
                      }}
                      style={(state) => {
                        const hovered = Boolean("hovered" in state && state.hovered);
                        const pressed = state.pressed;
                        return [
                          styles.termCard,
                          isSelected && styles.termCardActive,
                          {
                            borderColor: isSelected || hovered ? cat.color : "rgba(38,35,58,.16)",
                            shadowColor: hovered || pressed ? cat.color : "#26233A",
                            shadowOpacity: hovered ? 0.28 : pressed ? 0.20 : 0.16,
                            shadowRadius: hovered ? 20 : 10,
                            shadowOffset: { width: 0, height: hovered ? 16 : pressed ? 5 : 7 },
                            transform: [
                              { translateY: hovered ? -8 : pressed ? -2 : 0 },
                              { rotate: hovered ? "-1.2deg" : baseRotate },
                              { scale: hovered ? 1.018 : pressed ? 0.99 : 1 },
                            ],
                          },
                        ];
                      }}
                    >
                      <View style={styles.cornerTop} />
                      <View style={styles.cornerBottom} />
                      <View style={styles.fudaBand} />
                      <View style={styles.termFrame} />
                      <View style={[styles.termSeal, { backgroundColor: cat.color }]}>
                        <Text style={styles.termSealText}>{cat.seal}</Text>
                      </View>
                      <Text style={[styles.termRank, { color: cat.color }]}>{HANNARI[item.h as keyof typeof HANNARI].replace("レベル", "")}</Text>
                      <View style={styles.termImageStage}>
                        {art && <Image source={art} style={styles.termThumb} />}
                      </View>
                      <View style={styles.termBody}>
                        <Text style={[styles.termCat, { color: cat.color }]}>{cat.label}</Text>
                        <Text style={styles.term}>{item.k}</Text>
                        <Text style={styles.yomi}>{item.y}</Text>
                        <View style={styles.rule} />
                        <Text style={styles.meaning} numberOfLines={2}>
                          {stripHtml(item.choku)}
                        </Text>
                      </View>
                      <View style={styles.fudaFooter}>
                        <Text style={styles.fudaFooterLabel}>はんなり</Text>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <View
                            key={level}
                            style={[
                              styles.fudaFooterDot,
                              item.h >= level && { backgroundColor: cat.color, borderColor: cat.color },
                            ]}
                          />
                        ))}
                      </View>
                      <View style={styles.sharePill}>
                        <Text style={styles.sharePillText}>共有</Text>
                      </View>
                    </Pressable>
                  );
                }}
                numColumns={2}
                columnWrapperStyle={styles.cardGridRow}
              />
              {detailOpen && (
                <View style={styles.detailOverlay}>
                  <View style={styles.detail}>
                    <Pressable onPress={() => setDetailOpen(false)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>×</Text>
                    </Pressable>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
                      <View style={styles.detailFuda}>
                        <View style={styles.fudaBandTall} />
                        <View style={styles.detailFrame} />
                        <View style={styles.detailCornerTop} />
                        <View style={styles.detailCornerBottom} />
                        <View style={[styles.detailSeal, { backgroundColor: CATS[selected.c].color }]}>
                          <Text style={styles.detailSealText}>{CATS[selected.c].seal}</Text>
                        </View>
                        <Text style={styles.detailRank}>{HANNARI[selected.h as keyof typeof HANNARI].replace("レベル", "")}</Text>
                        <View style={styles.detailArtStage}>
                          {selectedArt && <Image source={selectedArt} style={styles.detailArt} />}
                        </View>
                        <Text style={styles.detailFudaTitle}>{selected.k}</Text>
                        <Text style={styles.detailFudaYomi}>{selected.y}</Text>
                        <Text style={[styles.detailFudaCat, { color: CATS[selected.c].color }]}>{CATS[selected.c].label}</Text>
                        <Text style={styles.detailFudaScene}>「{stripHtml(selected.scene)}」</Text>
                        <View style={styles.fudaBeans}>
                          <Text style={styles.fudaBeansLabel}>はんなり</Text>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <View
                              key={level}
                              style={[
                                styles.fudaBean,
                                selected.h >= level && { backgroundColor: CATS[selected.c].color },
                              ]}
                            />
                          ))}
                        </View>
                      </View>
                      <View style={styles.detailCopy}>
                        <View style={styles.mhead}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.detailTitle}>{selected.k}</Text>
                            <Text style={styles.detailYomi}>{selected.y}</Text>
                          </View>
                        </View>
                        <View style={styles.detailBlock}>
                          <Text style={styles.detailLabel}><Text style={styles.bnum}>1</Text> 直訳</Text>
                          <Text style={styles.detailText}>{stripHtml(selected.choku)}</Text>
                        </View>
                        <View style={styles.detailBlockHonne}>
                          <Text style={styles.detailLabel}><Text style={styles.bnum}>2</Text> 意訳</Text>
                          <Text style={styles.honneWarn}>意訳</Text>
                          <Text style={styles.honneText}>{stripHtml(selected.honne)}</Text>
                        </View>
                        <View style={styles.detailPlainBlock}>
                          <Text style={styles.detailLabel}><Text style={styles.bnum}>3</Text> なんでそう言う？</Text>
                          <Text style={styles.whyText}>{stripHtml(selected.why)}</Text>
                        </View>
                        <View style={styles.detailSceneBlock}>
                          <Text style={styles.detailLabel}><Text style={styles.bnum}>4</Text> こんな場面で</Text>
                          {!!selected.who && <Text style={styles.sceneWho}>{stripHtml(selected.who)}</Text>}
                          <Text style={styles.sceneText}>{stripHtml(selected.scene)}</Text>
                        </View>
                        <View style={styles.hannariBox}>
                          <Text style={styles.detailLabel}>はんなり度</Text>
                          <View style={styles.hMeter}>
                            {[1, 2, 3, 4, 5].map((level) => (
                              <View key={level} style={[styles.hGold, selected.h >= level && styles.hGoldOn]} />
                            ))}
                            <Text style={styles.hText}>Lv.{selected.h}・{HANNARI[selected.h as keyof typeof HANNARI]}</Text>
                          </View>
                        </View>
                        {!!selected.rel?.length && (
                          <View style={styles.relBox}>
                            <Text style={styles.detailLabel}>関連する京ことば</Text>
                            <View style={styles.relRail}>
                              {selected.rel.filter((rel) => findTerm(rel)).map((rel) => (
                                <Pressable
                                  key={rel}
                                  style={styles.relChip}
                                  onPress={() => {
                                    const next = findTerm(rel);
                                    if (next) setSelected(next);
                                  }}
                                >
                                  <Text style={styles.relChipText}>{rel}</Text>
                                </Pressable>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
          )}

      {mode === "map" && (
        <ScrollView contentContainerStyle={styles.mapScreen}>
          <View style={styles.mapHero}>
            <View style={styles.mapHeroCopy}>
              <Text style={styles.mapEyebrow}>洛中ことば地図</Text>
              <Text style={styles.mapTitle}>今の地理から、京ことばをひらく</Text>
              <Text style={styles.mapLead}>地名・通り名・街のあるあるにピンを置いた、デフォルメ概略地図です。</Text>
            </View>
            <Animated.View style={[styles.kotohaMapFrame, mapFloatStyle]}>
              <Image source={GUIDE_MAP} style={styles.mapGuide} />
            </Animated.View>
          </View>

          <ImageBackground source={RAKUCHU_MAP} resizeMode="cover" imageStyle={styles.mapBoardImage} style={styles.mapBoard}>
            <View style={styles.mapImageShade} />
            {MAP_SPOTS.map((spot) => {
              const active = selectedSpot.id === spot.id;
              const term = termForSpot(spot);
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
                  <Text style={[styles.mapPinText, active && styles.mapPinTextActive]}>{shortMapLabel(term.k)}</Text>
                </Pressable>
              );
            })}
          </ImageBackground>

            <View style={styles.spotCard}>
              <View style={styles.spotHeader}>
              <View style={styles.spotTitleBlock}>
                <Text style={styles.spotArea}>地図メモ</Text>
                <Text style={styles.spotName}>{mapTerm.k}</Text>
                <Text style={styles.spotKana}>{mapTerm.y}</Text>
              </View>
              <View style={[styles.spotBadge, { backgroundColor: CATS[mapTerm.c].color }]}>
                <Text style={styles.spotBadgeText}>{CATS[mapTerm.c].seal}</Text>
              </View>
            </View>
            {mapArt && <Image source={mapArt} style={styles.mapPanelArt} />}
            <Text style={styles.spotNote}>{selectedSpot.note}</Text>
            <View style={styles.mapInfoGrid}>
              <View style={styles.mapInfoBlock}>
                <Text style={styles.mapInfoLabel}>直訳</Text>
                <Text style={styles.mapTermText}>{stripHtml(mapTerm.choku)}</Text>
              </View>
              <View style={styles.mapInfoBlockPink}>
                <Text style={styles.mapInfoLabel}>意訳</Text>
                <Text style={styles.mapTermText}>{stripHtml(mapTerm.honne)}</Text>
              </View>
              <View style={styles.mapInfoBlock}>
                <Text style={styles.mapInfoLabel}>場面</Text>
                <Text style={styles.mapTermText}>{stripHtml(mapTerm.scene)}</Text>
              </View>
            </View>
            <Pressable
              style={styles.mapOpen}
              onPress={() => {
                setSelected(mapTerm);
                setMode("dict");
                setDetailOpen(true);
              }}
            >
              <Text style={styles.mapOpenText}>詳しく見る</Text>
            </Pressable>
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
            <Animated.View style={[styles.kotohaQuizFrame, quizFloatStyle]}>
              <Image source={GUIDE_QUIZ} style={styles.quizGuide} />
            </Animated.View>
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
  pastelWashMint: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: "46%",
    backgroundColor: "rgba(220, 247, 227, 0.42)",
  },
  pastelWashPink: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: "62%",
    backgroundColor: "rgba(255, 224, 236, 0.38)",
  },
  pastelWashCream: {
    position: "absolute",
    top: "34%",
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255, 246, 218, 0.28)",
  },
  appVeil: { flex: 1, backgroundColor: "rgba(255, 252, 245, 0.72)" },
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
  headerGuideWrap: { width: 72, alignItems: "center", justifyContent: "center" },
  headerGuide: { width: 58, height: 72, resizeMode: "contain" },
  guideName: {
    marginTop: -10,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
    borderWidth: 2,
    borderColor: "#26233A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: "center",
    shadowColor: "#26233A",
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  guideRole: { color: "#335C81", fontSize: 8, fontWeight: "900", lineHeight: 10 },
  guideText: { color: "#F26D88", fontSize: 13, fontWeight: "900", lineHeight: 15 },
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
    minHeight: 218,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(255,253,248,.54)",
    shadowColor: "#26233A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
  },
  dictHeroImage: { borderRadius: 21 },
  dictHeroShade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255, 248, 232, 0.34)",
  },
  dictHeroOverlay: {
    minHeight: 218,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  dictHeroCopy: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    backgroundColor: "rgba(255,253,248,.74)",
    padding: 14,
    shadowColor: "#26233A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
  },
  dictHeroKicker: { color: "#F26D88", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  dictHeroTitle: { marginTop: 5, color: "#26233A", fontSize: 22, lineHeight: 29, fontWeight: "900" },
  dictHeroText: { marginTop: 7, color: "#3F3849", fontSize: 12, lineHeight: 19, fontWeight: "900" },
  heroGuideWrap: { width: 92, alignItems: "center", marginRight: -4, marginBottom: -10 },
  heroGuide: { width: 104, height: 158, resizeMode: "contain" },
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
  list: { paddingVertical: 12, paddingBottom: 110 },
  cardGridRow: { gap: 10, marginBottom: 10 },
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
    flex: 1,
    maxWidth: "48.8%",
    minHeight: 338,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "rgba(255,246,251,.98)",
    borderWidth: 1,
    borderColor: "rgba(38,35,58,.16)",
    shadowColor: "#26233A",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 7 },
    overflow: "visible",
    alignItems: "center",
  },
  termCardActive: { backgroundColor: "#FFF7FB" },
  termFrame: {
    position: "absolute",
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    borderWidth: 1,
    borderColor: "#F78CAB",
    borderRadius: 14,
    opacity: 0.9,
  },
  cornerTop: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 18,
    height: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FF7E9C",
  },
  cornerBottom: {
    position: "absolute",
    right: 15,
    bottom: 15,
    width: 18,
    height: 18,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FF7E9C",
  },
  fudaBand: { display: "none" },
  termSeal: {
    position: "absolute",
    left: 18,
    top: 18,
    width: 38,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,253,248,.92)",
    shadowColor: "#26233A",
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    transform: [{ rotate: "-4deg" }],
    zIndex: 4,
  },
  termSealText: { color: "#FFFDF8", fontSize: 15, fontWeight: "900" },
  termRank: {
    position: "absolute",
    right: 15,
    top: 18,
    width: 16,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
    zIndex: 4,
  },
  termImageStage: {
    width: 132,
    height: 132,
    marginTop: 30,
    borderRadius: 999,
    borderWidth: 8,
    borderColor: "rgba(255,253,248,.92)",
    backgroundColor: "#F6E7CB",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#26233A",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
  },
  termThumb: {
    width: 146,
    height: 146,
    resizeMode: "cover",
  },
  seal: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sealText: { color: "#FFFFFF", fontWeight: "900" },
  termBody: { flex: 1, width: "100%", alignItems: "center" },
  termCat: { marginTop: 12, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  term: { marginTop: 5, fontSize: 19, lineHeight: 25, fontWeight: "900", color: "#26233A", textAlign: "center" },
  yomi: { marginTop: 6, fontSize: 10, fontWeight: "900", color: "#8A7D8D", letterSpacing: 2, textAlign: "center", textTransform: "uppercase" },
  rule: { width: 48, height: 1, backgroundColor: "rgba(38,35,58,.26)", marginTop: 7, marginBottom: 6 },
  meaning: { color: "#514754", fontSize: 11, fontWeight: "800", lineHeight: 16, textAlign: "center" },
  beans: { flexDirection: "row", gap: 4, marginTop: 7 },
  bean: { width: 10, height: 10, borderRadius: 999, borderWidth: 1, borderColor: "#D8CFC7", backgroundColor: "#F3EBDD" },
  beanOn: { backgroundColor: "#26233A", borderColor: "#26233A" },
  fudaFooter: {
    position: "absolute",
    bottom: 18,
    left: 48,
    right: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  fudaFooterLabel: { color: "#B89A5A", fontSize: 10, fontWeight: "900", marginRight: 3 },
  fudaFooterDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F4DDE5",
    backgroundColor: "#F7DFE7",
  },
  sharePill: {
    position: "absolute",
    right: 8,
    bottom: 8,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
    borderWidth: 2,
    borderColor: "#E4DAD0",
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: "#26233A",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  sharePillText: { color: "#514754", fontSize: 11, fontWeight: "900" },
  detailOverlay: {
    position: "absolute",
    top: 8,
    right: 0,
    bottom: 8,
    left: 0,
    zIndex: 30,
    justifyContent: "center",
    backgroundColor: "rgba(38,35,58,.18)",
    paddingHorizontal: 4,
  },
  detail: {
    maxHeight: "98%",
    borderRadius: 18,
    backgroundColor: "#FFFDF8",
    borderWidth: 3,
    borderColor: "#26233A",
    shadowColor: "#26233A",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 40,
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F0ECE6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4DAD0",
  },
  closeButtonText: { color: "#26233A", fontSize: 26, lineHeight: 28, fontWeight: "500" },
  detailScroll: { padding: 10, gap: 12 },
  detailFuda: {
    minHeight: 506,
    borderRadius: 18,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
    backgroundColor: "#FFF6FB",
    borderWidth: 1,
    borderColor: "rgba(38,35,58,.16)",
  },
  detailFrame: { position: "absolute", top: 12, right: 12, bottom: 12, left: 12, borderWidth: 1, borderColor: "#F78CAB", borderRadius: 13 },
  detailCornerTop: {
    position: "absolute",
    left: 18,
    top: 18,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FF7E9C",
  },
  detailCornerBottom: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 24,
    height: 24,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#FF7E9C",
  },
  fudaBandTall: { display: "none" },
  detailArtStage: {
    width: 230,
    height: 230,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#FFF3D0",
    borderWidth: 8,
    borderColor: "rgba(255,253,248,.94)",
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  detailArt: {
    width: 248,
    height: 248,
    resizeMode: "cover",
  },
  detailSeal: {
    position: "absolute",
    left: 18,
    top: 18,
    width: 42,
    height: 56,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFDF8",
  },
  detailSealText: { color: "#FFFDF8", fontWeight: "900" },
  detailRank: {
    position: "absolute",
    right: 14,
    top: 20,
    color: "#335C81",
    fontSize: 11,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  detailFudaTitle: { marginTop: 16, color: "#26233A", fontSize: 25, lineHeight: 32, fontWeight: "900", textAlign: "center" },
  detailFudaYomi: { marginTop: 3, color: "#514754", fontSize: 13, letterSpacing: 1.3 },
  detailFudaCat: { marginTop: 18, fontSize: 12, fontWeight: "900" },
  detailFudaScene: { marginTop: 12, color: "#4E4653", fontSize: 15, lineHeight: 24, textAlign: "center", fontWeight: "900" },
  fudaBeans: { position: "absolute", bottom: 18, flexDirection: "row", alignItems: "center", gap: 6 },
  fudaBeansLabel: { color: "#B89A5A", fontSize: 11, fontWeight: "900", marginRight: 4 },
  fudaBean: { width: 11, height: 11, borderRadius: 999, backgroundColor: "#F3D3DB" },
  fudaBeanOn: { backgroundColor: "#F26D88" },
  detailCopy: { padding: 4, gap: 12 },
  mhead: { paddingHorizontal: 4, paddingRight: 48, minHeight: 48, flexDirection: "row", alignItems: "flex-start" },
  detailTitle: { fontSize: 29, lineHeight: 36, fontWeight: "900", color: "#26233A" },
  detailYomi: { marginTop: 4, color: "#8A7D8D", fontSize: 12, fontWeight: "900", letterSpacing: 1.4 },
  detailBlock: { borderRadius: 16, backgroundColor: "rgba(66,184,168,.16)", borderWidth: 2, borderColor: "#8BDED4", padding: 14 },
  detailBlockHonne: { borderRadius: 16, backgroundColor: "rgba(242,109,136,.13)", borderWidth: 2, borderStyle: "dashed", borderColor: "#F26D88", padding: 14 },
  detailPlainBlock: { paddingHorizontal: 4, gap: 8 },
  detailSceneBlock: { borderRadius: 16, backgroundColor: "#FFF3D0", borderLeftWidth: 3, borderLeftColor: "#F6A23A", padding: 14 },
  detailLabel: { fontSize: 12, fontWeight: "900", color: "#655B50", letterSpacing: 0.5 },
  bnum: { color: "#FFFDF8", backgroundColor: "#26233A", fontSize: 11, fontWeight: "900" },
  detailText: { marginTop: 7, color: "#26233A", fontSize: 17, fontWeight: "900", lineHeight: 26 },
  honneWarn: { marginTop: 8, color: "#B6405E", fontSize: 12, fontWeight: "900" },
  honneText: { marginTop: 6, color: "#8F3352", fontSize: 18, fontWeight: "900", lineHeight: 30 },
  whyText: { color: "#4E4653", fontSize: 15, lineHeight: 27, fontWeight: "700" },
  sceneWho: { color: "#798852", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  sceneText: { color: "#8A7357", fontSize: 14, fontWeight: "800", lineHeight: 22 },
  hannariBox: { paddingHorizontal: 4 },
  hMeter: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7 },
  hGold: { width: 17, height: 17, borderRadius: 999, backgroundColor: "#E8DED4" },
  hGoldOn: { backgroundColor: "#D9B43A" },
  hText: { color: "#A06D22", fontSize: 14, fontWeight: "900" },
  relBox: { paddingHorizontal: 4, gap: 8 },
  relRail: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  relChip: { borderRadius: 999, backgroundColor: "#FFFDF8", borderWidth: 2, borderColor: "#E4DAD0", paddingHorizontal: 12, paddingVertical: 8 },
  relChipText: { color: "#335C81", fontSize: 13, fontWeight: "900" },
  mapScreen: { padding: 16, gap: 14 },
  mapHero: {
    minHeight: 164,
    borderRadius: 24,
    backgroundColor: "rgba(255,253,248,.92)",
    borderWidth: 0,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#26233A",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
  },
  mapHeroCopy: { flex: 1, paddingRight: 8 },
  mapEyebrow: { color: "#335C81", fontSize: 12, fontWeight: "900" },
  mapTitle: { marginTop: 8, color: "#26233A", fontSize: 24, lineHeight: 31, fontWeight: "900" },
  mapLead: { marginTop: 8, color: "#655B50", fontSize: 13, lineHeight: 20, fontWeight: "800" },
  kotohaMapFrame: {
    width: 104,
    height: 132,
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: -6,
    marginBottom: -4,
    shadowOpacity: 0,
  },
  mapGuide: { width: 108, height: 136, resizeMode: "contain", marginBottom: -2 },
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
    minWidth: 48,
    maxWidth: 94,
    minHeight: 34,
    marginLeft: -24,
    marginTop: -17,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    shadowColor: "#26233A",
    shadowOpacity: 0.28,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
  },
  mapPinText: { color: "#26233A", fontSize: 10, fontWeight: "900", textAlign: "center" },
  mapPinTextActive: { color: "#FFFFFF" },
  spotCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,253,248,.92)",
    borderWidth: 2,
    borderColor: "rgba(38,35,58,.16)",
    padding: 18,
    shadowColor: "#26233A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  spotHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  spotTitleBlock: { flex: 1, minWidth: 0, paddingRight: 8 },
  spotArea: { color: "#F26D88", fontSize: 12, fontWeight: "900" },
  spotName: { marginTop: 4, color: "#26233A", fontSize: 26, fontWeight: "900", lineHeight: 33, flexShrink: 1 },
  spotKana: { marginTop: 2, color: "#8A7D8D", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  spotBadge: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  spotBadgeText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  spotNote: { marginTop: 12, color: "#514754", fontSize: 14, fontWeight: "700", lineHeight: 22 },
  mapPanelArt: {
    width: "100%",
    height: 158,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#26233A",
    resizeMode: "cover",
    backgroundColor: "#F6E7CB",
  },
  phraseRail: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  phraseChip: { borderRadius: 999, backgroundColor: "#FFF4F7", borderWidth: 2, borderColor: "#F4C9D4", padding: 10 },
  phraseChipText: { color: "#A33652", fontSize: 12, fontWeight: "900" },
  mapTerm: { marginTop: 12, borderRadius: 16, backgroundColor: "#FAF6EE", padding: 13 },
  mapTermTitle: { color: "#26233A", fontSize: 16, fontWeight: "900" },
  mapTermText: { marginTop: 5, color: "#514754", fontSize: 13, fontWeight: "700", lineHeight: 20 },
  mapInfoGrid: { gap: 10, marginTop: 14 },
  mapInfoBlock: { borderRadius: 16, backgroundColor: "#FAF6EE", padding: 13, borderWidth: 1, borderColor: "#E4DAD0" },
  mapInfoBlockPink: { borderRadius: 16, backgroundColor: "#FFF4F7", padding: 13, borderWidth: 1, borderColor: "#F4C9D4" },
  mapInfoLabel: { color: "#F26D88", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  mapOpen: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#F26D88",
    borderWidth: 2,
    borderColor: "#26233A",
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: "#26233A",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  mapOpenText: { color: "#FFFDF8", fontSize: 13, fontWeight: "900" },
  quizScreen: { padding: 16, gap: 14 },
  quizHero: {
    minHeight: 190,
    borderRadius: 22,
    backgroundColor: "rgba(255,244,247,.82)",
    borderWidth: 0,
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
  kotohaQuizFrame: {
    width: 128,
    height: 166,
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    zIndex: 2,
    shadowOpacity: 0,
  },
  quizGuide: { width: 128, height: 166, resizeMode: "contain", marginBottom: -4 },
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
