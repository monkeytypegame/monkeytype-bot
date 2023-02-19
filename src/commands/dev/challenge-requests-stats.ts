import type { MonkeyTypes } from "../../types/types";
import { getStats } from "../../dal/challenge-request-stats";
import { MessageEmbedOptions } from "discord.js";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { Client } from "../../structures/client";

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
          url: Client.thumbnails.clipboard
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

    //take the first 10 elements from the embedOptions array
    const part1 = embedOptions.splice(0, 10);

    //take the last 10 elements from the embedOptions array
    const part2 = embedOptions.splice(11, 20);

    let embeds = part1.map((part1) => client.embed(part1));

    interaction.reply({
      embeds,
      ephemeral: true
    });

    embeds = part2.map((part2) => client.embed(part2));

    interaction.reply({
      embeds,
      ephemeral: true
    });
  }
} as MonkeyTypes.Command;
