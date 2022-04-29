/** @format */

import { Command } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { PersonalBest, User } from "../../types";
import { EmbedFieldData, MessageEmbed } from "discord.js";

export default {
  name: "personal-bests",
  description: "Shows your personal bests",
  category: "Stats",
  options: [
    {
      name: "user",
      description: "The user to get the personal bests of",
      type: "USER",
      required: false
    }
  ],
  run: async (interaction, client) => {
    const db = mongoDB();

    const discordUser = interaction.options.getUser("user") ?? interaction.user;

    const user = <Partial<User> | null>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (user === null) {
      interaction.reply({
        ephemeral: true,
        content: ":x: Could not find user. Make sure accounts are paired."
      });

      return;
    }

    const pbs = user?.personalBests;

    if (pbs === undefined) {
      interaction.reply({
        ephemeral: true,
        content:
          ":x: Could not find personal bests. Make sure accounts are paired and pbs are set."
      });

      return;
    }

    const sortedTime = pbs.time;
    const sortedWords = pbs.words;

    const timePB: { [key: number]: PersonalBest } = {};
    const wordsPB: { [key: number]: PersonalBest } = {};

    Object.entries(sortedTime).forEach(([key, timePBs]) => {
      const maxValue = timePBs?.sort((a, b) => b.wpm - a.wpm)[0];

      if (maxValue === undefined) {
        return;
      } else {
        timePB[+key] = maxValue;
      }
    });

    Object.entries(sortedWords).forEach(([key, wordsPBs]) => {
      const maxValue = wordsPBs?.sort((a, b) => b.wpm - a.wpm)[0];

      if (maxValue === undefined) {
        return;
      } else {
        wordsPB[+key] = maxValue;
      }
    });

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const timeEntryCount = Object.keys(timePB).length;
    const wordsEntryCount = Object.keys(wordsPB).length;

    const timeFields: EmbedFieldData[] = [];

    if (timeEntryCount !== 0) {
      Object.entries(timePB).map(([key, pb]) => {
        timeFields.push({
          name: `${key} seconds`,
          value: "‎",
          inline: true
        });
        timeFields.push({
          name: `${pb.wpm} wpm`,
          value: `${pb.acc}% acc`,
          inline: true
        });
        timeFields.push({
          name: `${pb.raw} raw`,
          value: `${pb.consistency}% con`,
          inline: true
        });
      });
    }

    const timeEmbed =
      timeEntryCount !== 0
        ? client.embed(
            {
              title: `Time Personal Bests for ${nameDisplay}`,
              color: 0xe2b714,
              thumbnail: {
                url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/alarm-clock_23f0.png"
              },
              fields: timeFields
            },
            discordUser
          )
        : undefined;

    const wordsFields: EmbedFieldData[] = [];

    if (timeEntryCount !== 0) {
      Object.entries(wordsPB).map(([key, pb]) => {
        wordsFields.push({
          name: `${key} words`,
          value: "‎",
          inline: true
        });
        wordsFields.push({
          name: `${pb.wpm} wpm`,
          value: `${pb.acc}% acc`,
          inline: true
        });
        wordsFields.push({
          name: `${pb.raw} raw`,
          value: `${pb.consistency}% con`,
          inline: true
        });
      });
    }

    const wordsEmbed =
      wordsEntryCount !== 0
        ? client.embed(
            {
              title: `Word Personal Bests for ${nameDisplay}`,
              color: 0xe2b714,
              thumbnail: {
                url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/clipboard_1f4cb.png"
              },
              fields: wordsFields
            },
            discordUser
          )
        : undefined;

    interaction.reply({
      embeds: [timeEmbed, wordsEmbed].filter(
        (embed) => embed !== undefined
      ) as MessageEmbed[]
    });
  }
} as Command;
