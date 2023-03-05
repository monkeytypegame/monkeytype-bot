import { Collection } from "discord.js";
import { Client } from "../../structures/client";
import type { MonkeyTypes } from "../../types/types";
import { mongoDB } from "../../utils/mongodb";

const DEFAULT_TIME = [15, 30, 60, 120];
const DEFAULT_WORDS = [10, 25, 50, 100];

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
        content: "❌ Could not find user. Make sure accounts are linked."
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

    const timeCollection = getCollection(personalBests.time, DEFAULT_TIME);
    const wordsCollection = getCollection(personalBests.words, DEFAULT_WORDS);

    const timePB = timeCollection.mapValues(getBest);
    const wordsPB = wordsCollection.mapValues(getBest);

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const timeEmbed = client.embed(
      {
        title: `Time Personal Bests for ${nameDisplay}`,
        color: 0xe2b714,
        thumbnail: {
          url: Client.thumbnails.alarmClock
        },
        fields: timePB
          .map((personalBest, key) => [
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
    );

    const wordsEmbed = client.embed(
      {
        title: `Word Personal Bests for ${nameDisplay}`,
        color: 0xe2b714,
        thumbnail: {
          url: Client.thumbnails.clipboard
        },
        fields: wordsPB
          .map((personalBest, key) => [
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
    );

    const embeds = [timeEmbed, wordsEmbed].filter(
      (embed) => embed.fields.length > 0
    );

    if (embeds.length === 0) {
      interaction.reply(
        "❌ Could not find personal bests. Make sure accounts are paired and you have personal bests."
      );

      return;
    }

    interaction.reply({
      embeds
    });
  }
} as MonkeyTypes.Command;

function getCollection(
  record: Record<number, MonkeyTypes.PersonalBest[]> | undefined,
  allowList: number[]
): Collection<string, MonkeyTypes.PersonalBest[]> {
  const entries = Object.entries(record ?? {});

  const filteredEntries = entries.filter(([key]) => allowList.includes(+key));

  return new Collection(filteredEntries);
}

function getBest(
  personalBests: MonkeyTypes.PersonalBest[]
): MonkeyTypes.PersonalBest {
  return personalBests.reduce((previous, current) =>
    previous.wpm > current.wpm ? previous : current
  );
}
