import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { MessageEmbedOptions } from "discord.js";
import { getStats } from "../../dal/challenge-request-stats";
import { Client } from "../../structures/client";
import type { MonkeyTypes } from "../../types/types";
import { createChunks } from "../../utils/chunks";

export default {
  name: "challenge-requests-stats",
  description: "Check which mods are slacking",
  category: "Dev",
  options: [],
  needsPermissions: true,
  run: async (interaction) => {
    await interaction.deferReply({
      ephemeral: true
    });

    const stats = await getStats();

    const embedOptionsArray = stats.map((stat) => {
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

    if (embedOptionsArray.length === 0) {
      interaction.followUp("No stats found");

      return;
    }

    const toSend = createChunks(embedOptionsArray, 10);

    for (const embeds of toSend) {
      await interaction.followUp({
        embeds,
        ephemeral: true
      });
    }
  }
} as MonkeyTypes.Command;
