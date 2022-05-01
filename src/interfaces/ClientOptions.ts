/** @format */

import { ClientOptions as DiscordClientOptions } from "discord.js";

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
}

export interface ClientOptions extends DiscordClientOptions {
  repo: string;
  repoPath: string;
  commandsPath: string;
  eventsPath: string;
  tasksPath: string;
  deleteUnusedSlashCommands: boolean;
  guildId: string;
  dev: boolean;
  devID: string;
  roles: Roles;
  wpmRoles: WPMRole[];
  challenges: Challenges;
  channels: Channels;
}
