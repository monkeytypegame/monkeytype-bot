/** @format */

import { NewsChannel, TextChannel } from "discord.js";
import type { MonkeyTypes } from "../../types/types";

export default {
  name: "say",
  description: "Say something in another channel",
  category: "Utility",
  options: [
    {
      name: "channel",
      description: "The channel to say the message in",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
      required: true
    },
    {
      name: "message",
      description: "The message to send",
      type: "STRING",
      required: true
    }
  ],
  needsPermissions: true,
  run: async (interaction) => {
    const channel = interaction.options.getChannel("channel", true) as
      | TextChannel
      | NewsChannel;

    const message = interaction.options.getString("message", true);

    channel.send({ content: message });

    interaction.reply({ ephemeral: true, content: "💬 Done." });
  }
} as MonkeyTypes.Command;
