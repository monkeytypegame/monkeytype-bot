/** @format */

import { Command } from "../../interfaces/Command";
import { getData, getUser } from "../../functions/banana";

export default {
  name: "banana-top",
  description: "Shows the top banana users",
  category: "Banana",
  run: async (interaction, client) => {
    const user = getUser(interaction.user.id);

    const embed = client.embed(
      {
        title: "Top 10 Banana Hoarders",
        color: 0xe2b714,
        thumbnail: {
          url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
        }
      },
      interaction.user
    );

    const data = getData();

    const sortedData = Object.entries(data).sort(
      (a, b) => (b[1].balance ?? 0) - (a[1].balance ?? 0)
    );

    const sortedData10 = sortedData.slice(0, 10);

    embed.addField(
      "Top",
      sortedData10
        .map(
          ([id, user], index) =>
            `\`${index + 1}\`: ${client.users.cache.get(id)?.tag} (${
              user.balance ?? 0
            } bananas)`
        )
        .join("\n")
    );

    if (
      user !== undefined &&
      !sortedData10.find(([id]) => id === interaction.user.id)
    ) {
      const userIndex = sortedData.findIndex(
        ([id]) => id === interaction.user.id
      );

      embed.addField(
        "You",
        `\`${userIndex + 1}\`: ${interaction.user.tag} (${
          user?.balance ?? 0
        } bananas)`,
        false
      );
    }

    interaction.reply({
      embeds: [embed]
    });
  }
} as Command;
