/** @format */

import { ApplicationCommandOption, CommandInteraction } from "discord.js";
import { Client } from "../structures/Client";

export interface Command {
  name: string;
  description: string;
  category: string;
  options?: ApplicationCommandOption[];
  needsPermissions?: boolean;
  run: (interaction: CommandInteraction, client: Client) => any;
}
