import { GuildMember } from "discord.js";
import { Client } from "../structures/client";
import type { MonkeyTypes } from "../types/types";
import { getPositionString } from "../utils/get-position-string";

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
        message: "Invalid parameters",
        member: discordUserID
      };
    }

    const member =
      (await guild.members.fetch(discordUserID).catch(() => undefined)) ??
      discordUserID;

    const displayName =
      typeof member === "string" ? member : member.displayName;

    const loungeChannel = await client.getChannel("lounge");

    if (loungeChannel === undefined) {
      return {
        status: false,
        message: "Could not send leaderboard update announcement",
        member
      };
    }

    const posString = getPositionString(pos);

    const leaderboard = lb.replace(/-/g, " ");

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

    await loungeChannel.send({ embeds: [embed] });

    return {
      status: true,
      message: `${displayName} ${posString} ${leaderboard} ${wpm} wpm`,
      member
    };
  }
} as MonkeyTypes.TaskFile;
