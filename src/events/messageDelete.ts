/** @format */

import { Event } from "../interfaces/Event";

export default {
  event: "messageDelete",
  run: async (client, message) => {
    if (message.guild === null || message.author?.bot) {
      return;
    }

    client.logInBotLogChannel(
      `:wastebasket: ${message.author}'s message in ${message.channel} was deleted:\n${message.content}`
    );
  }
} as Event<"messageDelete">;
