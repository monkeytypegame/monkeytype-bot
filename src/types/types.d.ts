import {
  ApplicationCommandOption,
  ApplicationCommandType,
  ButtonInteraction,
  CacheType,
  ClientEvents,
  Collection,
  CommandInteraction,
  ClientOptions as DiscordClientOptions,
  Guild,
  GuildMember,
  InteractionCollector,
  MessageContextMenuInteraction,
  UserContextMenuInteraction
} from "discord.js";
import { Document, WithId } from "mongodb";
import { Client } from "../structures/client";

declare namespace MonkeyTypes {
  export interface ChallengeRequest extends WithId<Document> {
    userID: string;
    messageID: string;
    challengeRoleID: string;
    proof: string[];
    timestamp: number;
  }

  export interface ChallengeRequestStats extends WithId<Document> {
    userID: string;
    accepted?: number;
    denied?: number;
    lastAccepted?: number;
    lastDenied?: number;
  }

  interface Roles {
    memberRole: string;
  }

  interface WPMRole {
    id: string;
    min: number;
    max: number;
  }

  interface Challenges {
    [key: string]: string;
  }

  export interface Channels {
    botLog: string;
    lounge: string;
    updates: string;
    botCommands: string;
    challengeSubmissions: string;
    challengeSubmissionsMods: string;
    chatWithGeorge: string;
    typing: string;
  }

  export interface ClientOptions extends DiscordClientOptions {
    repo: string;
    repoPath: string;
    commandsPath: string;
    eventsPath: string;
    tasksPath: string;
    deleteUnusedSlashCommands: boolean;
    guildID: string;
    dev: boolean;
    devID: string;
    roles: Roles;
    wpmRoles: WPMRole[];
    challenges: Challenges;
    channels: Channels;
  }

  interface Command<T extends ApplicationCommandType = "CHAT_INPUT"> {
    name: string;
    description?: string;
    category: string;
    type?: T;
    options?: ApplicationCommandOption[];
    needsPermissions?: boolean;
    run: (
      interaction: T extends "CHAT_INPUT"
        ? CommandInteraction
        : T extends "MESSAGE"
        ? MessageContextMenuInteraction
        : UserContextMenuInteraction,
      client: Client<true>
    ) => void;
  }

  interface Event<E extends keyof ClientEvents> {
    event: E;
    run: (client: Client<true>, ...eventArgs: ClientEvents[E]) => void;
  }

  interface Task extends WithId<Document> {
    name: string;
    args: any[];
    requestTimestamp?: number;
  }

  interface TaskResult {
    status: boolean;
    message: string;
    member?: GuildMember | string;
  }

  interface TaskFile {
    name: string;
    run: (
      client: Client<true>,
      guild: Guild,
      ...args: any[]
    ) => Promise<TaskResult>;
  }

  type Difficulty = "normal" | "expert" | "master";

  type Mode = "time" | "words" | "quote" | "zen" | "custom";

  type Mode2<M extends Mode> = keyof PersonalBests[M];

  type CoinFlip = "h" | "t";

  interface Quote {
    text: string;
    source: string;
    length: number;
    id: number;
    group?: number;
    textSplit?: string[];
  }

  interface QuoteCollection {
    quotes: Quote[];
    length?: number;
    language?: string;
    groups: number[][] | Quote[][];
  }

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
  interface User extends WithId<Document> {
    uid: string;
    name: string;
    startedTests: number;
    completedTests: number;
    timeTyping: number;
    personalBests: PersonalBests;
    bananas?: number;
  }

  interface LeaderboardEntry extends WithId<Document> {
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

  interface DailyLeaderboardEntry {
    uid: string;
    name: string;
    wpm: number;
    raw: number;
    acc: number;
    consistency: number;
    timestamp: number;
    rank?: number;
    count?: number;
  }

  interface ChartData {
    wpm: number[];
    raw: number[];
    err: number[];
    unsmoothedRaw?: number[];
  }

  interface KeyStats {
    average: number;
    sd: number;
  }

  interface Result<M extends Mode> {
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

  interface BananaEntry {
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

  interface BananaData {
    [key: string]: Partial<BananaEntry>;
  }

  type PollVotes = Collection<string, Set<string>>;

  type PollOptions = string[];

  interface Poll {
    prompt: string;
    isVisible: boolean;
    votes: MonkeyTypes.PollVotes;
    collector: InteractionCollector<ButtonInteraction<CacheType>>;
  }

  interface GitHubLabel {
    name: string;
  }
}
