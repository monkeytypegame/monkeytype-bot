/** @format */

import { mongoDB } from "../../functions/mongodb";
import { Command } from "../../interfaces/Command";
import { User } from "../../types";
import moment from "moment";

export default {
  name: "stats",
  description: "Shows the amount of completed test and total time typing",
  category: "Stats",

  options: [
    {
      name: "user",
      description: "The user to get the stats of",
      type: "USER",
      required: false
    }
  ],
  run: async (interaction, client) => {
    const db = mongoDB();

    const discordUser = interaction.options.getUser("user") ?? interaction.user;

    const user = <User | null>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (user === null) {
      interaction.reply({
        ephemeral: true,
        content: ":x: Could not find user. Make sure accounts are paired."
      });

      return;
    }

    const duration = moment.duration({ seconds: user.timeTyping });

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const embed = client.embed({
      title: `Typing Stats for ${nameDisplay}`,
      color: 0xe2b714,
      thumbnail: {
        url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/bar-chart_1f4ca.png"
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
          value: `${duration.hours().toString().padStart(2, "0")}:${duration
            .minutes()
            .toString()
            .padStart(2, "0")}:${duration
            .seconds()
            .toString()
            .padStart(2, "0")}`,
          inline: false
        }
      ],
      footer: {
        text: "www.monkeytype.com"
      }
    });

    interaction.reply({
      embeds: [embed]
    });
  }
} as Command;
