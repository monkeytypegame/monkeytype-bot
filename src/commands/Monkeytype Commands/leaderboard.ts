import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { Document, WithId } from "mongodb";

interface LeaderboardEntry extends WithId<Document> {
  difficulty: string;
  timestamp: number;
  language: string;
  wpm: number;
  consistency: number | "-";
  punctuation: boolean;
  acc: number;
  raw: number;
  uid?: string;
  name: string;
  discordId?: string;
  rank: number;
  count?: number;
  hidden?: boolean;
}

interface User extends WithId<Document> {
  uid: string;
}

export default {
  name: "leaderboard",
  description: "Shows a paginated leaderboard that shows your rank",
  category: "Monkeytype",
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
  roles: [RolesEnum.MEMBER],
  run: async (interaction, client) => {
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
      send: async (embed, row) => {
        if (leaderboardUser !== null) {
          embed.addField(
            "You",
            `\`${leaderboardUser.rank}\`: ${leaderboardUser.name} (${leaderboardUser.wpm} wpm)`
          );
        }

        return await interaction.reply({
          embeds: [embed],
          components: [row],
          fetchReply: true
        });
      }
    });
  }
} as Command;
