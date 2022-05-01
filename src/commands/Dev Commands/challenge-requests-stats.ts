/** @format */

import type { Command } from "../../interfaces/Command";
import { getStats } from "../../dal/challengeRequestStats";
import { MessageEmbedOptions } from "discord.js";
import formatDistance from "date-fns/formatDistance";

export default {
  name: "challenge-requests-stats",
  description: "Check which mods are slacking",
  category: "Dev",
  options: [],
  needsPermissions: true,
  run: async (interaction, client) => {
    const stats = await getStats();

    const embedOptions = stats.map((stat) => {
      const embedOptions: MessageEmbedOptions = {};
      const member = interaction.guild?.members.cache.get(stat.userID);
      embedOptions.title = `Challenge Requests Stats for ${member?.displayName}`;
      embedOptions.thumbnail = {
        url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/clipboard_1f4cb.png"
      };
      embedOptions.color = 0xe2b714;

      embedOptions.fields = [
        {
          name: "Accepted",
          value: stat.accepted?.toString() ?? "-",
          inline: true
        },
        {
          name: "Last Accepted",
          value: stat.lastAccepted
            ? formatDistance(new Date(), stat.lastAccepted) + " ago"
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
            ? formatDistance(new Date(), stat.lastDenied) + " ago"
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
      ];
      return embedOptions;
    });

    const embeds = embedOptions.map((embedOptions) => {
      return client.embed(embedOptions);
    });

    interaction.reply({
      embeds,
      ephemeral: true
    });
  }
} as Command;
