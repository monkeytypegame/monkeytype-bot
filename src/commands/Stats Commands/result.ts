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
  run: async (interaction, client) => {
    const db = mongoDB();

    interation.user

    const user = <User | null>(
      await db.collection("users").findOne({ discordId: interation.user.id })
    );

    if (user === null) {
      interaction.reply({
        ephemeral: true,
        content: ":x: Could not find user. Make sure accounts are paired."
      });

      return;
    }

    await interaction.deferReply({
      ephemeral: false,
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
        ephemeral: false,
        content: ":x: No recent result found."
      });

      return;
    }

    const nameDisplay =
      user.name === interation.user.username
        ? user.name
        : `${user.name} (${interation.user.username})`;

    const embed = client.embed({
      title: `Recent Result for ${nameDisplay}`,
      color: 0xe2b714
    });

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
          ephemeral: false,
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
        ephemeral: false,
        content: ":x: Last result was not time, mode, or quote"
      });

      return;
    }

    interaction.followUp({
      ephemeral: false,
      embeds: [embed]
    });
  }
} as Command;
