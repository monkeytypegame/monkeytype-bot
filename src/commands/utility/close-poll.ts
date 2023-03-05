import { MessageActionRow, MessageEmbed } from "discord.js";
import { MonkeyTypes } from "../../types/types";
import { mapOptions } from "../../utils/polls";

export default {
  name: "close-poll",
  description: "Close a poll",
  category: "Utility",
  type: "MESSAGE",
  run: async (interaction, client) => {
    const message = interaction.targetMessage;

    if (
      message === undefined ||
      message.embeds.length === 0 ||
      message.components === undefined ||
      message.components.length === 0 ||
      !(message.components as MessageActionRow[])[0]?.components.every(
        (component) => component.customId?.includes("poll#")
      )
    ) {
      interaction.reply("❌ This message is not a poll.");

      return;
    }

    const embed = new MessageEmbed(message.embeds[0]);

    const pollID = embed.footer?.text.substring(
      (embed.footer?.text.indexOf("Poll ID: ") ?? 0) + 9
    );

    if (pollID === undefined) {
      interaction.reply("❌ This message is not a poll.");

      return;
    }

    const poll = client.polls.get(pollID);

    if (poll === undefined) {
      interaction.reply("❌ This poll does not exist.");

      return;
    }

    poll.collector.stop();

    interaction.reply({
      content: `✅ Poll Closed\n\`\`\`\n${mapOptions({
        ...poll,
        isVisible: true
      })}\n\`\`\``,
      ephemeral: true
    });
  }
} as MonkeyTypes.Command<"MESSAGE">;
