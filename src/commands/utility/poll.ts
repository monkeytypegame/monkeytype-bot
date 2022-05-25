/** @format */

import {
  Collection,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from "discord.js";
import type { MonkeyTypes } from "../../types/types";
import { Client } from "../../structures/client";
import { mapOptions } from "../../functions/map-options";

const optionsFormat = '"Option 1,Option 2,Option 3"';

export default {
  name: "poll",
  description: "Create a poll",
  category: "Utility",
  options: [
    {
      name: "prompt",
      description: "Prompt of the poll",
      type: "STRING",
      required: true
    },
    {
      name: "options",
      description: `Options in this format: ${optionsFormat}`,
      type: "STRING",
      required: true
    },
    {
      name: "visible",
      description: "Should the results be visible to everyone?",
      type: "BOOLEAN",
      required: true
    },
    {
      name: "days",
      description: "How many days should the poll last?",
      type: "INTEGER",
      required: false,
      maxValue: 24,
      minValue: 1
    }
  ],
  run: async (interaction, client) => {
    const prompt = interaction.options.getString("prompt", true);

    const optionsString = interaction.options.getString("options", true);

    const isVisible = interaction.options.getBoolean("visible", true);

    const hours =
      (interaction.options.getInteger("days", false) ?? 1 / 24) * 24;

    const options = optionsString.split(",");

    if (options.length === 0 || !validateOptions(options)) {
      interaction.reply(
        `Invalid option format:\nPlease use the following format: ${optionsFormat}`
      );

      return;
    }

    if (new Set(options).size !== options.length) {
      interaction.reply("Duplicate options are not allowed.");

      return;
    }

    const votes: MonkeyTypes.PollVotes = new Collection();

    for (const option of options) {
      votes.set(option, new Set());
    }

    // generate random string
    const pollID = Math.random().toString(36).substring(2, 15);

    const embed = client.embed({
      title: "Poll",
      description: `${prompt}\n\n${mapOptions(options, votes, isVisible)}`,
      color: 0xe2b714,
      thumbnail: {
        url: Client.thumbnails.barChart
      },
      footer: {
        text: `Poll ID: ${pollID}`
      }
    });

    const row = new MessageActionRow();

    row.addComponents(
      options.map((value, index) =>
        new MessageButton()
          .setCustomId(`poll#${pollID}#${index}`)
          .setLabel(value)
          .setStyle("SECONDARY")
          .setDisabled(false)
      )
    );

    const message = await interaction.channel?.send({
      embeds: [embed],
      components: [row]
    });

    if (message === undefined) {
      return;
    }

    interaction.reply({
      content: "✅ Poll created",
      ephemeral: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: "BUTTON",
      dispose: true,
      time: hours * 60 * 60 * 1000
    });

    client.polls.set(pollID, { prompt, isVisible, votes, collector });

    function poll(): MonkeyTypes.Poll | undefined {
      return client.polls.get(pollID);
    }

    collector.on("collect", (buttonInteraction) => {
      const userID = buttonInteraction.user.id;

      if (poll()?.votes.find((set) => set.has(userID))) {
        buttonInteraction.reply({
          content: "❌ You have already voted!",
          ephemeral: true
        });

        return;
      }

      const optionIndex = buttonInteraction.customId.split("#")[2];

      if (optionIndex === undefined) {
        return;
      }

      const value = options[parseInt(optionIndex)];

      if (value === undefined) {
        return;
      }

      poll()?.votes.get(value)?.add(userID);

      if (message.embeds[0] !== undefined) {
        const newEmbed = new MessageEmbed(message.embeds[0]);

        newEmbed.setDescription(
          `${prompt}\n\n${mapOptions(
            options,
            poll()?.votes ?? votes,
            isVisible
          )}`
        );

        message.edit({ embeds: [newEmbed], components: [row] });
      }

      buttonInteraction.reply({
        content: `✅ Thanks for voting!`,
        ephemeral: true
      });
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        return;
      }

      const embed = client.embed({
        title: "Poll Over",
        description: `${prompt}\n\n${mapOptions(
          options,
          poll()?.votes ?? votes,
          isVisible
        )}`,
        color: 0xe2b714,
        thumbnail: {
          url: Client.thumbnails.barChart
        },
        footer: {
          text: `Poll ID: ${pollID}`
        }
      });

      client.logInBotLogChannel(
        `Poll over (${pollID}):\n${prompt}\n\`\`\`\n${mapOptions(
          options,
          poll()?.votes ?? votes,
          true
        )}\n\`\`\``
      );

      client.polls.delete(pollID);

      message.edit({ embeds: [embed], components: [] });
    });
  }
} as MonkeyTypes.Command;

function validateOptions(
  options: MonkeyTypes.PollOptions
): options is MonkeyTypes.PollOptions {
  return !options.includes("");
}
