import { ApplicationCommandOption, CommandInteraction } from "discord.js";
import { Client } from "../structures/Client";

export enum RolesEnum {
  ADMINISTRATOR = "adminRole",
  MODERATOR = "modRole",
  MEMBER = "memberRole",
  UPDATE_PING = "updatePingRole",
  COLLABORATOR = "collaboratorRole"
}

export interface Command {
  name: string;
  description: string;
  category: string;
  options?: ApplicationCommandOption[];
  roles?: RolesEnum[];
  requiredChannel?: string;
  run: (interaction: CommandInteraction, client: Client) => any;
}
