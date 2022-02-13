import { ApplicationCommandOption, CommandInteraction } from "discord.js";
import { Client } from "../structures/Client";

export interface Command {
  name: string;
  description: string;
  category: string;
  options?: ApplicationCommandOption[];
  run: (interaction: CommandInteraction, client: Client) => any;
}
