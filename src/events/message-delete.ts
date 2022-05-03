/** @format */

import type { MonkeyTypes } from "../types/types";

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
} as MonkeyTypes.Event<"messageDelete">;
