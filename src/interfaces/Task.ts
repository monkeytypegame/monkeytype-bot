/** @format */

import { Guild } from "discord.js";
import { Document, WithId } from "mongodb";
import { Client } from "../structures/Client";

export interface Task extends WithId<Document> {
  name: string;
  args: any[];
  requestTimestamp: number;
}

export interface TaskResult {
  status: boolean;
  message: string;
}

export interface TaskFile {
  name: string;
  run: (
    client: Client<true>,
    guild: Guild,
    ...args: any[]
  ) => Promise<TaskResult>;
}

export type QueuedTask = Task & TaskFile;
