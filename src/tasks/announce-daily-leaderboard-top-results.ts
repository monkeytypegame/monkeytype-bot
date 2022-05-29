import { MonkeyTypes } from "../types/types";
import { Client } from "../structures/client";
import { EmbedFieldData } from "discord.js";
import { getPositionString } from "../functions/get-position-string";

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

    // console.log(
    //   client.user.username,
    //   guild.name,
    //   leaderboardID,
    //   new Date(leaderboardTimestamp),
    //   topResults
    // );

    const fields: EmbedFieldData[] = [];

    topResults.forEach((entry, i) => {
      fields.push({
        name: getPositionString(entry.rank ?? i + 1),
        value: entry.name,
        inline: true
      });
      fields.push({
        name: `${entry.wpm} wpm`,
        value: `${entry.acc}% acc`,
        inline: true
      });
      fields.push({
        name: `${entry.raw} raw`,
        value: `${entry.consistency}% con`,
        inline: true
      });
    });

    const embed = client.embed({
      title: `Daily ${leaderboardID} leaderboard result`,
      color: 0xe2b714,
      thumbnail: {
        url: Client.thumbnails.crown
      },
      fields
    });

    (await client.getChannel("lounge"))?.send({
      embeds: [embed]
    });

    return {
      status: true,
      message: "Successfully announced leaderboard top results"
    };
  }
} as MonkeyTypes.TaskFile;
