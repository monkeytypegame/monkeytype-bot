/** @format */

import { TaskFile } from "../interfaces/Task";

export default {
  name: "announceLeaderboardUpdate",
  run: async (
    client,
    guild,
    discordUserID: string,
    pos: number,
    lb: string,
    wpm: number,
    raw: number,
    acc: number,
    con: number
  ) => {
    if (
      discordUserID === undefined ||
      pos === undefined ||
      lb === undefined ||
      wpm === undefined ||
      raw === undefined ||
      acc === undefined ||
      con === undefined
    ) {
      return {
        status: false,
        message: "Invalid parameters"
      };
    }

    const member = guild.members.cache.get(discordUserID) ?? discordUserID;

    const displayName =
      typeof member === "string" ? member : member.displayName;

    const loungeChannel = await client.getChannel("lounge");

    const posString = positionToString(pos);

    const leaderboard = lb.replace(/-/g, " ");

    if (loungeChannel !== undefined) {
      const embed = client.embed({
        title: "Leaderboard Update",
        description: `${displayName} just got \`${posString}\` place on the \`${leaderboard}\` leaderboard!`,
        thumbnail: {
          url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/star_2b50.png"
        },
        color: 0xe2b714,
        fields: [
          { name: "wpm", value: wpm.toString(), inline: true },
          { name: "raw", value: raw.toString(), inline: true },
          { name: "\u200B", value: "\u200B", inline: true },
          { name: "accuracy", value: `${acc}%`, inline: true },
          { name: "consistency", value: `${con}%`, inline: true },
          { name: "\u200B", value: "\u200B", inline: true }
        ]
      });

      await loungeChannel.send({ embeds: [embed] });

      return {
        status: true,
        message: `${displayName} ${posString} ${leaderboard} ${wpm} wpm`
      };
    } else {
      return {
        status: false,
        message: "Could not send leaderboard update announcement"
      };
    }
  }
} as TaskFile;

function positionToString(pos: number): string {
  switch (pos) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return `${pos}th`;
  }
}
