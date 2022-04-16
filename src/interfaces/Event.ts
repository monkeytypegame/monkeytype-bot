/** @format */

import { ClientEvents } from "discord.js";
import { Client } from "../structures/Client";

export interface Event<E extends keyof ClientEvents> {
  event: E;
  run: (client: Client, ...eventArgs: ClientEvents[E]) => any;
}
