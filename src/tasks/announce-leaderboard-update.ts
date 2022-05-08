import { GuildMember } from "discord.js";
import { Client } from "../structures/client";
import type { MonkeyTypes } from "../types/types";

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
    console.log(discordUserID, pos, lb, wpm, raw, acc, con);
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

    console.log("1");

    console.log(guild);

    const member =
      (await guild.members.fetch(discordUserID).catch(() => undefined)) ??
      discordUserID;

    console.log("2");

    const displayName =
      typeof member === "string" ? member : member.displayName;

    console.log("3");

    const loungeChannel = await client.getChannel("lounge");

    console.log("4");

    if (loungeChannel === undefined) {
      return {
        status: false,
        message: "Could not send leaderboard update announcement"
      };
    }

    console.log("5");

    const posString = positionToString(pos);

    console.log("6");

    const leaderboard = lb.replace(/-/g, " ");

    console.log("7");

    const embed = client.embed(
      {
        title: "Leaderboard Update",
        description: `${displayName} just got \`${posString}\` place on the \`${leaderboard}\` leaderboard!`,
        thumbnail: {
          url: Client.thumbnails.star
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
      },
      member instanceof GuildMember ? member.user : undefined
    );

    console.log("8");

    await loungeChannel.send({ embeds: [embed] });

    console.log("9");

    return {
      status: true,
      message: `${displayName} ${posString} ${leaderboard} ${wpm} wpm`
    };
  }
} as MonkeyTypes.TaskFile;

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
