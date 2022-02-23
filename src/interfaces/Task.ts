import { Guild } from "discord.js";
import { Client } from "../structures/Client";

export interface Task {
  name: string;
  run: (
    client: Client,
    guild: Guild
  ) => Promise<{ status: boolean; message: string }>;
}
