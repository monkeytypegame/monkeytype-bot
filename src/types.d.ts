import { Document, WithId } from "mongodb";

type Difficulty = "normal" | "expert" | "master";

interface PersonalBest {
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

interface PersonalBests {
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
