/** @format */

import { MessageActionRow, MessageButton } from "discord.js";
import type { MonkeyTypes } from "../../types/types";
import { Client } from "../../structures/client";

export default {
  name: "poll",
  description: "Create a poll",
  category: "Utility",
  options: [
    {
      name: "question",
      description: "Question of the poll",
      type: "STRING",
      required: true
    },
    {
      name: "options",
      description: "Options separated by a comma",
      type: "STRING",
      required: true
    },
    {
      name: "resultsvisible",
      description: "Are results visible toeveryone?",
      type: "BOOLEAN",
      required: true
    }
  ],
  run: async (interaction, client) => {
    const question = interaction.options.getString("question", true) || "";

    let optionsString = "";
    const options = interaction.options.getString("options", true).split(",");
    for (let i = 0; i < options.length; i++) {
      const option = options[i] || "";
      optionsString += `${i + 1} - ${option.trim()}\n`;
    }

    const description = `${question}\n\n${optionsString}`;

    const embed = client.embed({
      title: "Poll",
      description,
      color: 0xe2b714,
      thumbnail: {
        url: Client.thumbnails.barChart
      }
    });

    const row = new MessageActionRow();

    for (let i = 0; i < options.length; i++) {
      const button = new MessageButton()
        .setCustomId("option" + i)
        .setLabel((i + 1).toString())
        .setStyle("SECONDARY")
        .setDisabled(false);

      row.addComponents(button);
    }

    const pollEmbed = await interaction?.channel?.send({
      embeds: [embed],
      components: [row]
    });

    const pollEmbedId = pollEmbed?.id;

    interaction.reply({
      content: "✅ Poll created",
      ephemeral: true
    });

    const buttonInteraction = await client.awaitMessageComponent(
      interaction.channel,
      (i) => pollEmbedId === i.message.id,
      "BUTTON"
    );

    console.log(buttonInteraction);

    interaction.reply("Thanks for voting");
  }
} as MonkeyTypes.Command;
