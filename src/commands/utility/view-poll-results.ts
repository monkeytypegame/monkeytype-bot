import { MessageActionRow, MessageEmbed } from "discord.js";
import { MonkeyTypes } from "../../types/types";
import { mapOptions } from "../../utils/polls";

export default {
  name: "view-poll-results",
  description: "View a poll's results",
  category: "Utility",
  type: "MESSAGE",
  run: async (interaction, client) => {
    const message = interaction.targetMessage;

    if (
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

    const pollEmbed = new MessageEmbed(message.embeds[0]);

    const pollID = pollEmbed.footer?.text.substring(
      (pollEmbed.footer?.text.indexOf("Poll ID: ") ?? 0) + 9
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

    interaction.reply({
      content: `Poll Results:\n\`\`\`\n${mapOptions({
        ...poll,
        isVisible: true
      })}\n\`\`\``,
      ephemeral: true
    });
  }
} as MonkeyTypes.Command<"MESSAGE">;
