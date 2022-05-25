import { MonkeyTypes } from "../types/types";

export default {
  name: "announceDailyLeaderboardTopResults",
  run: async (
    client,
    guild,
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

    console.log(
      client.user.username,
      guild.name,
      leaderboardID,
      leaderboardTimestamp,
      topResults
    );

    return {
      status: true,
      message: "Successfully announced leaderboard top results"
    };
  }
} as MonkeyTypes.TaskFile;
