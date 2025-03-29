import type { MonkeyTypes } from "../../types/types";
import { mongoDB } from "../../utils/mongodb";
import { toPascalCase } from "../../utils/strings";

export default {
  name: "leaderboard",
  description: "Shows a paginated leaderboard that shows your rank",
  category: "Stats",
  options: [
    // {
    //   name: "language",
    //   description: "The langauge to query",
    //   type: "STRING",
    //   required: true
    // },
    // {
    //   name: "mode",
    //   description: "The mode to query",
    //   type: "STRING",
    //   required: true,
    //   choices: [
    //     {
    //       name: "time",
    //       value: "time"
    //     },
    //     {
    //       name: "words",
    //       value: "words"
    //     },
    //     {
    //       name: "quote",
    //       value: "quote"
    //     }
    //   ]
    // },
    {
      name: "mode2",
      description: "The mode2 to query",
      type: "STRING",
      required: true,
      // remove these choices when words/quote lbs are added
      choices: [
        {
          name: "15",
          value: "15"
        },
        {
          name: "60",
          value: "60"
        }
      ]
    }
  ],
  run: async (interaction, client) => {
    await interaction.deferReply({ fetchReply: false });

    const db = mongoDB();

    const language = "english"; // interaction.options.getString("language", true);
    const mode = "time"; // interaction.options.getString("mode", true);
    const mode2 = interaction.options.getString("mode2", true);

    const user = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({ discordId: interaction.user.id })
    );

    const leaderboardUser =
      user !== undefined
        ? <MonkeyTypes.LeaderboardEntry | undefined>(
            await db
              .collection(`leaderboards.${language}.${mode}.${mode2}`)
              .findOne({ uid: user.uid })
          )
        : undefined;

    const leaderboardArray = <MonkeyTypes.LeaderboardEntry[]>(
      await db
        .collection(`leaderboards.${language}.${mode}.${mode2}`)
        .find()
        .sort("rank", "ascending")
        .limit(100)
        .toArray()
    );

    if (leaderboardArray.length === 0) {
      interaction.followUp(
        "❌ There are no users on the leaderboard. Did you enter in a valid mode?"
      );

      return;
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
      fieldName: `Leaderboard (${toPascalCase(mode)} ${mode2})`,
      //@ts-expect-error stuff doesnt boot
      send: (embed, row, currentEntries) => {
        if (
          leaderboardUser !== undefined &&
          !currentEntries?.find((entry) => entry.includes(leaderboardUser.name))
        ) {
          embed.addField(
            "You",
            `\`${leaderboardUser.rank}\`: ${leaderboardUser.name} (${leaderboardUser.wpm} wpm)`
          );
        }

        return interaction.followUp({
          embeds: [embed],
          components: fieldArray.length < 10 ? [] : [row],
          fetchReply: true
        });
      },
      onPageChange: (embed, currentEntries) => {
        if (embed.fields[1] !== undefined) {
          if (
            leaderboardUser === undefined ||
            currentEntries?.find((entry) =>
              entry.includes(leaderboardUser.name)
            )
          ) {
            embed.fields.splice(1, 1);
          }
        } else {
          if (
            leaderboardUser !== undefined &&
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
} as MonkeyTypes.Command;
