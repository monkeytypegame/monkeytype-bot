/** @format */

import { Command } from "../../interfaces/Command";
import { User, LeaderboardEntry } from "../../types";
import { mongoDB } from "../../functions/mongodb";

export default {
  name: "leaderboard",
  description: "Shows a paginated leaderboard that shows your rank",
  category: "Stats",
  options: [
    {
      name: "language",
      description: "The langauge to query",
      type: "STRING",
      required: true
    },
    {
      name: "mode",
      description: "The mode to query",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "time",
          value: "time"
        },
        {
          name: "words",
          value: "words"
        },
        {
          name: "quote",
          value: "quote"
        }
      ]
    },
    {
      name: "mode2",
      description: "The mode2 to query",
      type: "STRING",
      required: true
    }
  ],
  run: async (interaction, client) => {
    await interaction.deferReply({
      ephemeral: false,
      fetchReply: false
    });

    const db = mongoDB();

    const language = interaction.options.getString("language", true);
    const mode = interaction.options.getString("mode", true);
    const mode2 = interaction.options.getString("mode2", true);

    const user = <User | null>(
      await db.collection("users").findOne({ discordId: interaction.user.id })
    );

    const leaderboardUser =
      user !== null
        ? <LeaderboardEntry>(
            await db
              .collection(`leaderboards.${language}.${mode}.${mode2}`)
              .findOne({ uid: user.uid })
          )
        : null;

    const leaderboardArray = <LeaderboardEntry[]>(
      await db
        .collection(`leaderboards.${language}.${mode}.${mode2}`)
        .find()
        .sort("rank", "descending")
        .limit(100)
        .toArray()
    );

    if (leaderboardArray.length === 0) {
      return interaction.followUp(
        ":x: There are no users on the leaderboard. Did you enter in a valid mode?"
      );
    }

    const fieldArray = leaderboardArray.map(
      (entry) => `\`${entry.rank}\`: ${entry.name} (${entry.wpm} wpm)`
    );

    const embedOptions = {
      title: "Leaderboard",
      description: `Top 100 people on the leaderboard`,
      color: 0x5aef5c,
      thumbnail: {
        url: interaction.user.avatarURL({ dynamic: true }) ?? "None"
      }
    };

    client.paginate({
      embedOptions,
      interaction,
      amount: 10,
      entries: fieldArray,
      id: "leaderboard",
      fieldName: "Leaderboard",
      send: async (embed, row, currentEntries) => {
        if (
          leaderboardUser !== null &&
          !currentEntries?.find((entry) => entry.includes(leaderboardUser.name))
        ) {
          embed.addField(
            "You",
            `\`${leaderboardUser.rank}\`: ${leaderboardUser.name} (${leaderboardUser.wpm} wpm)`
          );
        }

        return await interaction.followUp({
          embeds: [embed],
          components: [row],
          fetchReply: true
        });
      },
      onPageChange: (embed, currentEntries) => {
        if (embed.fields[1] !== undefined) {
          if (
            leaderboardUser === null ||
            currentEntries?.find((entry) =>
              entry.includes(leaderboardUser.name)
            )
          ) {
            embed.fields.splice(1, 1);
          }
        } else {
          if (
            leaderboardUser !== null &&
            !currentEntries?.find((entry) =>
              entry.includes(leaderboardUser.name)
            )
          ) {
            embed.addField(
              "You",
              `\`${leaderboardUser.rank}\`: ${leaderboardUser.name} (${leaderboardUser.wpm} wpm)`
            );
          }
        }

        return embed;
      }
    });

    return;
  }
} as Command;
