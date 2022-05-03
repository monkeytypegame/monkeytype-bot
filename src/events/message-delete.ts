/** @format */

import type { Event } from "../interfaces/event";

export default {
  event: "messageDelete",
  run: async (client, message) => {
    if (message.guild === null || message.author?.bot) {
      return;
    }

    client.logInBotLogChannel(
      `🗑️ ${message.author}'s message in ${message.channel} was deleted:\n${message.content}`
    );
  }
} as Event<"messageDelete">;
