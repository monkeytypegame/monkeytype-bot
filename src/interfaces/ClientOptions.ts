import { ClientOptions as DiscordClientOptions } from "discord.js";

interface Roles {
  adminRole: string;
  modRole: string;
  memberRole: string;
  updatePingRole: string;
  collaboratorRole: string;
}

interface WPMRole {
  id: string;
  min: number;
  max: number;
}

interface Challenges {
  [key: string]: string;
}

interface Channels {
  botLog: string;
  general: string;
  updates: string;
}

export interface ClientOptions extends DiscordClientOptions {
  repo: string;
  repoPath: string;
  commandsPath: string;
  eventsPath: string;
  deleteUnusedSlashCommands: boolean;
  secret: string;
  guildId: string;
  githubApiToken: string;
  dev: boolean;
  devID: string;
  roles: Roles;
  wpmRoles: WPMRole[];
  challenges: Challenges;
  channels: Channels;
}
