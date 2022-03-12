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
