/** @format */

import { Document, WithId } from "mongodb";

export type Difficulty = "normal" | "expert" | "master";

export type Mode = "time" | "words" | "quote" | "zen" | "custom";

export type Mode2<M extends Mode> = keyof PersonalBests[M];

export interface Quote {
  text: string;
  source: string;
  length: number;
  id: number;
  group?: number;
  language: string;
  textSplit?: string[];
}

export type QuoteCollection = {
  quotes: Quote[];
  length?: number;
  language?: string;
  groups: number[][] | Quote[][];
};

export interface PersonalBest {
  acc: number;
  consistency: number;
  difficulty: Difficulty;
  lazyMode: boolean;
  language: string;
  punctuation: boolean;
  raw: number;
  wpm: number;
  timestamp: number;
}

export interface PersonalBests {
  time: {
    [key: number]: PersonalBest[];
  };
  words: {
    [key: number]: PersonalBest[];
  };
  quote: { [quote: string]: PersonalBest[] };
  custom: { custom: PersonalBest[] };
  zen: {
    zen: PersonalBest[];
  };
}
export interface User extends WithId<Document> {
  uid: string;
  name: string;
  startedTests: number;
  completedTests: number;
  timeTyping: number;
  personalBests: PersonalBests;
  bananas?: number;
}

export interface LeaderboardEntry extends WithId<Document> {
  difficulty: Difficulty;
  timestamp: number;
  language: string;
  wpm: number;
  consistency: number | "-";
  punctuation: boolean;
  acc: number;
  raw: number;
  uid?: string;
  name: string;
  discordId?: string;
  rank: number;
  count?: number;
  hidden?: boolean;
}

export interface Config {
  theme: string;
  themeLight: string;
  themeDark: string;
  autoSwitchTheme: boolean;
  customTheme: boolean;
  customThemeColors: string[];
  favThemes: string[];
  showKeyTips: boolean;
  showLiveWpm: boolean;
  showTimerProgress: boolean;
  smoothCaret: boolean;
  quickTab: boolean;
  punctuation: boolean;
  numbers: boolean;
  words: WordsModes;
  time: TimeModes;
  mode: Mode;
  quoteLength: QuoteLength[];
  language: string;
  fontSize: FontSize;
  freedomMode: boolean;
  resultFilters?: ResultFilters | null;
  difficulty: Difficulty;
  blindMode: boolean;
  quickEnd: boolean;
  caretStyle: CaretStyle;
  paceCaretStyle: CaretStyle;
  flipTestColors: boolean;
  layout: string;
  funbox: string;
  confidenceMode: ConfidenceMode;
  indicateTypos: IndicateTypos;
  timerStyle: TimerStyle;
  colorfulMode: boolean;
  randomTheme: RandomTheme;
  timerColor: TimerColor;
  timerOpacity: TimerOpacity;
  stopOnError: StopOnError;
  showAllLines: boolean;
  keymapMode: KeymapMode;
  keymapStyle: KeymapStyle;
  keymapLegendStyle: KeymapLegendStyle;
  keymapLayout: string;
  fontFamily: string;
  smoothLineScroll: boolean;
  alwaysShowDecimalPlaces: boolean;
  alwaysShowWordsHistory: boolean;
  singleListCommandLine: SingleListCommandLine;
  capsLockWarning: boolean;
  playSoundOnError: boolean;
  playSoundOnClick: PlaySoundOnClick;
  soundVolume: SoundVolume;
  startGraphsAtZero: boolean;
  swapEscAndTab: boolean;
  showOutOfFocusWarning: boolean;
  paceCaret: PaceCaret;
  paceCaretCustomSpeed: number;
  repeatedPace: boolean;
  pageWidth: PageWidth;
  chartAccuracy: boolean;
  chartStyle: ChartStyle;
  minWpm: MinimumWordsPerMinute;
  minWpmCustomSpeed: number;
  highlightMode: HighlightMode;
  alwaysShowCPM: boolean;
  enableAds: EnableAds;
  hideExtraLetters: boolean;
  strictSpace: boolean;
  minAcc: MinimumAccuracy;
  minAccCustom: number;
  showLiveAcc: boolean;
  showLiveBurst: boolean;
  monkey: boolean;
  repeatQuotes: RepeatQuotes;
  oppositeShiftMode: OppositeShiftMode;
  customBackground: string;
  customBackgroundSize: CustomBackgroundSize;
  customBackgroundFilter: CustomBackgroundFilter;
  customLayoutfluid: CustomLayoutFluid;
  monkeyPowerLevel: MonkeyPowerLevel;
  minBurst: MinimumBurst;
  minBurstCustomSpeed: number;
  burstHeatmap: boolean;
  britishEnglish: boolean;
  lazyMode: boolean;
  showAvg: boolean;
}

export interface Result<M extends Mode> {
  _id: string;
  wpm: number;
  rawWpm: number;
  charStats: number[];
  correctChars?: number; // --------------
  incorrectChars?: number; // legacy results
  acc: number;
  mode: M;
  mode2: Mode2<M>;
  quoteLength: number;
  timestamp: number;
  restartCount: number;
  incompleteTestSeconds: number;
  testDuration: number;
  afkDuration: number;
  tags: string[];
  consistency: number;
  keyConsistency: number;
  chartData: ChartData | "toolong";
  uid: string;
  keySpacingStats: KeyStats;
  keyDurationStats: KeyStats;
  isPb?: boolean;
  bailedOut?: boolean;
  blindMode?: boolean;
  lazyMode?: boolean;
  difficulty: Difficulty;
  funbox?: string;
  language: string;
  numbers?: boolean;
  punctuation?: boolean;
  hash?: string;
}

export interface BananaEntry {
  balance: number;
  lastCollect: number;
  flipLosses: number;
  flipWins: number;
  bananajackLosses: number;
  rpsWins: number;
  rpsLosses: number;
  rpsTies: number;
  bananajackTies: number;
  bananajackWins: number;
}

export interface BananaData {
  [key: string]: Partial<BananaEntry>;
}
