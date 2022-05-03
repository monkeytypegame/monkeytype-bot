/** @format */

import { ClientEvents } from "discord.js";
import { Client } from "../structures/client";

export interface Event<E extends keyof ClientEvents> {
  event: E;
  run: (client: Client<true>, ...eventArgs: ClientEvents[E]) => any;
}
