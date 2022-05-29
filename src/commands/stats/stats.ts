import { mongoDB } from "../../functions/mongodb";
import type { MonkeyTypes } from "../../types/types";
import intervalToDuration from "date-fns/intervalToDuration";
import formatDuration from "date-fns/formatDuration";
import { Client } from "../../structures/client";

export default {
  name: "stats",
  description: "Shows the amount of completed test and total time typing",
  category: "Stats",
  options: [
    {
      name: "user",
      description: "The user to get the personal bests of",
      type: "USER",
      required: false
    }
  ],
  run: async (interaction, client) => {
    const discordUser = interaction.options.getUser("user") ?? interaction.user;

    const db = mongoDB();

    const user = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (user === undefined) {
      interaction.reply({
        ephemeral: true,
        content: "❌ Could not find user. Make sure accounts are paired."
      });

      return;
    }

    const duration = formatDuration(
      intervalToDuration({ start: 0, end: user.timeTyping * 1000 })
    );

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const embed = client.embed(
      {
        title: `Typing Stats for ${nameDisplay}`,
        color: 0xe2b714,
        thumbnail: {
          url: Client.thumbnails.barChart
        },
        fields: [
          {
            name: "Tests Started",
            value: user.startedTests.toString(),
            inline: false
          },
          {
            name: "Tests Completed",
            value: user.completedTests.toString(),
            inline: false
          },
          {
            name: "Test Completion Rate",
            value: (
              (user.completedTests || 1) / (user.startedTests || 1)
            ).toFixed(2),
            inline: false
          },
          {
            name: "Time Typing",
            value: duration,
            inline: false
          }
        ]
      },
      discordUser
    );

    interaction.reply({
      embeds: [embed]
    });
  }
} as MonkeyTypes.Command;
