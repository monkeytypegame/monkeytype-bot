/** @format */

import { Command } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { PersonalBest, User } from "../../types";

export default {
  name: "personal-bests",
  description: "Shows your personal bests",
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

    const pbs = user.personalBests;

    const sortedTime = pbs.time;
    const sortedWords = pbs.words;

    const timePB: { [key: number]: PersonalBest } = {};
    const wordsPB: { [key: number]: PersonalBest } = {};

    Object.entries(sortedTime).forEach(([key, timePBs]) => {
      const maxValue = timePBs?.sort((a, b) => b.wpm - a.wpm)[0];

      if (maxValue === undefined) {
        return;
      } else {
        timePB[+key] = maxValue;
      }
    });

    Object.entries(sortedWords).forEach(([key, wordsPBs]) => {
      const maxValue = wordsPBs?.sort((a, b) => b.wpm - a.wpm)[0];

      if (maxValue === undefined) {
        return;
      } else {
        wordsPB[+key] = maxValue;
      }
    });

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const embed = client.embed({
      title: `Personal Bests for ${nameDisplay}`,
      color: 0xe2b714,
      thumbnail: {
        url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/alarm-clock_23f0.png"
      }
    });

    embed.addFields(
      Object.entries(timePB).map(([key, pb]) => ({
        name: `${key} seconds`,
        value: `${pb.wpm} wpm (${pb.raw} raw) ${pb.acc}% acc`
      }))
    );

    embed.addFields(
      Object.entries(wordsPB).map(([key, pb]) => ({
        name: `${key} words`,
        value: `${pb.wpm} wpm (${pb.raw} raw) ${pb.acc}% acc`
      }))
    );

    interaction.reply({ embeds: [embed] });
  }
} as Command;
