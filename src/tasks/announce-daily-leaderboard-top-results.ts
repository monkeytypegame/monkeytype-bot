import { EmbedFieldData } from "discord.js";
import { Client } from "../structures/client";
import { MonkeyTypes } from "../types/types";
import { getPositionString } from "../utils/get-position-string";

export default {
  name: "announceDailyLeaderboardTopResults",
  run: async (
    client,
    _guild,
    leaderboardID: string,
    leaderboardTimestamp: number,
    topResults: MonkeyTypes.DailyLeaderboardEntry[]
  ) => {
    if (
      leaderboardID === undefined ||
      leaderboardTimestamp === undefined ||
      topResults === undefined
    ) {
      return {
        status: false,
        message: "Invalid parameters"
      };
    }

    const fields: EmbedFieldData[] = topResults
      .map((entry, i) => [
        {
          name: getPositionString(entry.rank ?? i + 1),
          value: entry.name,
          inline: true
        },
        { name: `${entry.wpm} wpm`, value: `${entry.acc}% acc`, inline: true },
        {
          name: `${entry.raw} raw`,
          value: `${entry.consistency}% con`,
          inline: true
        }
      ])
      .flat();

    const embed = client.embed({
      title: `Daily ${leaderboardID} leaderboard result`,
      color: 0xe2b714,
      thumbnail: {
        url: Client.thumbnails.crown
      },
      fields
    });

    const typingChannel = await client.getChannel("typing");

    if (!typingChannel) {
      return {
        status: false,
        message: "Could not find typing channel"
      };
    }

    typingChannel.send({
      embeds: [embed]
    });

    return {
      status: true,
      message: "Successfully announced leaderboard top results"
    };
  }
} as MonkeyTypes.TaskFile;
