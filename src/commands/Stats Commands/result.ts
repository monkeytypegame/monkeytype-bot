/** @format */

import { Command } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { User, Result, Mode, QuoteCollection } from "../../types";
import { toPascalCase } from "../../functions/toPascalCase";
import fetch from "node-fetch-commonjs";

export default {
  name: "result",
  description: "Shows the most recent result",
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

    await interaction.deferReply({
      fetchReply: false
    });

    const result = <Result<Mode> | undefined>(
      (
        await db
          .collection("results")
          .find({ uid: user.uid })
          .limit(1)
          .sort({ $natural: -1 })
          .toArray()
      )[0]
    );

    if (result === undefined) {
      interaction.followUp({
        content: ":x: No recent result found."
      });

      return;
    }

    const nameDisplay =
      user.name === discordUser.username
        ? user.name
        : `${user.name} (${discordUser.username})`;

    const embed = client.embed(
      {
        title: `Recent Result for ${nameDisplay}`,
        color: 0xe2b714
      },
      discordUser
    );

    const language = result.language ?? "english";

    if (["time", "words"].includes(result.mode)) {
      embed.addField(
        toPascalCase(`${result.mode} ${result.mode2}`),
        `${result.wpm} wpm (${result.rawWpm} raw)\n${result.acc}% accuracy, ${result.consistency}% consistency\nLanguage: ${language}`
      );
    } else if (result.mode === "quote") {
      const res = await fetch(
        `https://raw.githubusercontent.com/${client.clientOptions.repo}/master/frontend/static/quotes/${language}.json`
      );

      const quoteColl = <QuoteCollection>await res.json();

      const quote = quoteColl.quotes.find(
        (quote) => +quote.id === +result.mode2
      );

      if (quote === undefined) {
        interaction.followUp({
          content: ":x: Could not find quote"
        });

        return;
      }

      embed.addFields([
        {
          name: "Quote",
          value: `${result.wpm} wpm (${result.rawWpm} raw)\n${result.acc}% accuracy, ${result.consistency}% consistency\nLanguage: ${language}`,
          inline: false
        },
        {
          name: "Quote Text",
          value: `Source: ${quote.source}\n\`\`\`\n${quote.text}\n\`\`\``,
          inline: false
        }
      ]);
    } else {
      interaction.followUp({
        content: ":x: Last result was not time, mode, or quote"
      });

      return;
    }

    interaction.followUp({
      embeds: [embed]
    });
  }
} as Command;
