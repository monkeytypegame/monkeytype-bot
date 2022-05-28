import type { MonkeyTypes } from "../../types/types";
import { mongoDB } from "../../functions/mongodb";
import { MessageEmbed } from "discord.js";
import { Client } from "../../structures/client";

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

    const user = <Partial<MonkeyTypes.User> | undefined>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (user === undefined) {
      interaction.reply({
        ephemeral: true,
        content: "❌ Could not find user. Make sure accounts are paired."
      });

      return;
    }

    const personalBests = user?.personalBests;

    if (personalBests === undefined) {
      interaction.reply({
        ephemeral: true,
        content:
          "❌ Could not find personal bests. Make sure accounts are paired and you have personal bests."
      });

      return;
    }

    const sortedTime = personalBests.time;
    const sortedWords = personalBests.words;

    const timePB: { [key: number]: MonkeyTypes.PersonalBest } = {};
    const wordsPB: { [key: number]: MonkeyTypes.PersonalBest } = {};

    const defaultTime = [15, 30, 60, 120];
    const defaultWords = [10, 25, 50, 100];

    for (const [key, timePBs] of Object.entries(sortedTime)) {
      if (!defaultTime.includes(+key)) {
        continue;
      }

      const maxValue = timePBs?.sort((a, b) => b.wpm - a.wpm)[0];

      if (maxValue === undefined) {
        continue;
      } else {
        timePB[+key] = maxValue;
      }
    }

    for (const [key, wordsPBs] of Object.entries(sortedWords)) {
      if (!defaultWords.includes(+key)) {
        continue;
      }

      const maxValue = wordsPBs?.sort((a, b) => b.wpm - a.wpm)[0];

      if (maxValue === undefined) {
        continue;
      } else {
        wordsPB[+key] = maxValue;
      }
    }

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const timeEntryCount = Object.keys(timePB).length;
    const wordsEntryCount = Object.keys(wordsPB).length;

    const timeEmbed =
      timeEntryCount !== 0
        ? client.embed(
            {
              title: `Time Personal Bests for ${nameDisplay}`,
              color: 0xe2b714,
              thumbnail: {
                url: Client.thumbnails.alarmClock
              },
              fields: Object.entries(timePB)
                .map(([key, personalBest]) => [
                  {
                    name: `${key} seconds`,
                    value: "‎",
                    inline: true
                  },
                  {
                    name: `${personalBest.wpm} wpm`,
                    value: `${personalBest.acc}% acc`,
                    inline: true
                  },
                  {
                    name: `${personalBest.raw} raw`,
                    value: `${personalBest.consistency}% con`,
                    inline: true
                  }
                ])
                .flat()
            },
            discordUser
          )
        : undefined;

    const wordsEmbed =
      wordsEntryCount !== 0
        ? client.embed(
            {
              title: `Word Personal Bests for ${nameDisplay}`,
              color: 0xe2b714,
              thumbnail: {
                url: Client.thumbnails.clipboard
              },
              fields: Object.entries(wordsPB)
                .map(([key, personalBest]) => [
                  {
                    name: `${key} words`,
                    value: "‎",
                    inline: true
                  },
                  {
                    name: `${personalBest.wpm} wpm`,
                    value: `${personalBest.acc}% acc`,
                    inline: true
                  },
                  {
                    name: `${personalBest.raw} raw`,
                    value: `${personalBest.consistency}% con`,
                    inline: true
                  }
                ])
                .flat()
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
} as MonkeyTypes.Command;
