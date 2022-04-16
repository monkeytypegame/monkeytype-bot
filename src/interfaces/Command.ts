/** @format */

import { ApplicationCommandOption, CommandInteraction } from "discord.js";
import { Client } from "../structures/Client";
import type { Channels } from "./ClientOptions";

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
  requiredChannel?: keyof Channels;
  run: (interaction: CommandInteraction, client: Client) => any;
}
