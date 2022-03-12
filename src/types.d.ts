import { Document, WithId } from "mongodb";

export interface User extends WithId<Document> {
  uid: string;
  name: string;
  startedTests: number;
  completedTests: number;
  timeTyping: number;
}

export interface LeaderboardEntry extends WithId<Document> {
  difficulty: string;
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
