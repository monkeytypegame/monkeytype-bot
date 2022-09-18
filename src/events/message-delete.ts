import { MessageEmbed } from "discord.js";
import type { MonkeyTypes } from "../types/types";

export default {
  event: "messageDelete",
  run: async (client, message) => {
    if (message.guild === null || message.author?.bot) {
      return;
    }

    const embeds = message.attachments.map((attachment) => {
      return new MessageEmbed().setImage(attachment.proxyURL);
    });

    client.logInBotLogChannel({
      content: `🗑️ ${message.author}'s message in ${
        message.channel
      } was deleted:\n${message.content ?? ""}`,
      embeds
    });
  }
} as MonkeyTypes.Event<"messageDelete">;
