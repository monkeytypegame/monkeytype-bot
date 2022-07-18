import { ApplicationCommandType, EmbedBuilder } from "discord.js";
import { mapOptions } from "../../functions/map-options";
import { MonkeyTypes } from "../../types/types";

export default {
  name: "close-poll",
  description: "Close a poll",
  category: "Utility",
  type: ApplicationCommandType.Message,
  run: async (interaction, client) => {
    const message = interaction.targetMessage;

    if (
      message === undefined ||
      message.embeds.length === 0 ||
      message.components === undefined ||
      message.components.length === 0 ||
      !message.components[0]?.components.every((component) =>
        component.customId?.includes("poll#")
      )
    ) {
      interaction.reply("❌ This message is not a poll.");

      return;
    }

    const embed = new EmbedBuilder(message.embeds[0]?.data);

    const pollID = embed.data.footer?.text.substring(
      (embed.data.footer?.text.indexOf("Poll ID: ") ?? 0) + 9
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
} as MonkeyTypes.Command<ApplicationCommandType.Message>;
