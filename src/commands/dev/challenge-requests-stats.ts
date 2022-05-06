/** @format */

import type { MonkeyTypes } from "../../types/types";
import { getStats } from "../../dal/challenge-request-stats";
import { MessageEmbedOptions } from "discord.js";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

export default {
  name: "challenge-requests-stats",
  description: "Check which mods are slacking",
  category: "Dev",
  options: [],
  needsPermissions: true,
  run: async (interaction, client) => {
    const stats = await getStats();

    const embedOptions = stats.map((stat) => {
      const member = interaction.guild?.members.cache.get(stat.userID);

      const embedOptions: MessageEmbedOptions = {
        title: `Challenge Requests Stats for ${member?.displayName}`,
        thumbnail: {
          url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/clipboard_1f4cb.png"
        },
        color: 0xe2b714,
        fields: [
          {
            name: "Accepted",
            value: stat.accepted?.toString() ?? "-",
            inline: true
          },
          {
            name: "Last Accepted",
            value: stat.lastAccepted
              ? formatDistanceToNow(stat.lastAccepted) + " ago"
              : "-",
            inline: true
          },
          {
            name: "‎",
            value: "‎",
            inline: true
          },
          {
            name: "Denied",
            value: stat.denied?.toString() ?? "-",
            inline: true
          },
          {
            name: "Last Denied",
            value: stat.lastDenied
              ? formatDistanceToNow(stat.lastDenied) + " ago"
              : "-",
            inline: true
          },
          {
            name: "‎",
            value: "‎",
            inline: true
          },
          {
            name: "Total",
            value: ((stat.accepted ?? 0) + (stat.denied ?? 0)).toString(),
            inline: true
          }
        ]
      };

      return embedOptions;
    });

    if (embedOptions.length === 0) {
      interaction.reply("No stats found");

      return;
    }

    const embeds = embedOptions.map((embedOptions) =>
      client.embed(embedOptions)
    );

    interaction.reply({
      embeds,
      ephemeral: true
    });
  }
} as MonkeyTypes.Command;
