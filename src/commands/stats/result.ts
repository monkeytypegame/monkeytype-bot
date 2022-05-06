/** @format */

import type { MonkeyTypes } from "../../types/types";
import { mongoDB } from "../../functions/mongodb";
import { toPascalCase } from "../../functions/to-pascal-case";
import fetch from "node-fetch-commonjs";

const quoteLengthMap = {
  1: "short",
  2: "medium",
  3: "long",
  4: "thicc"
};

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

    const user = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (user === undefined || user.uid === undefined) {
      interaction.reply({
        ephemeral: true,
        content: "❌ Could not find user. Make sure accounts are paired."
      });

      return;
    }

    await interaction.deferReply({
      fetchReply: false
    });

    const result = <MonkeyTypes.Result<MonkeyTypes.Mode> | undefined>(
      (
        await db
          .collection("results")
          .find({ uid: user.uid })
          .limit(1)
          .sort({ timestamp: -1 })
          .toArray()
      )[0]
    );

    if (result === undefined) {
      interaction.followUp({
        content: "❌ No recent result found."
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
      embed.addFields(
        {
          name: toPascalCase(`${result.mode} ${result.mode2}`),
          value: toPascalCase(language),
          inline: true
        },
        {
          name: `${result.wpm} wpm`,
          value: `${result.acc}% acc`,
          inline: true
        },
        {
          name: `${result.rawWpm} raw`,
          value: `${result.consistency}% con`,
          inline: true
        }
      );
    } else if (result.mode === "quote") {
      const res = await fetch(
        `https://raw.githubusercontent.com/${client.clientOptions.repo}/master/frontend/static/quotes/${language}.json`
      );

      const quoteColl = <MonkeyTypes.QuoteCollection>await res.json();

      const quote = quoteColl.quotes.find(
        (quote) => +quote.id === +result.mode2
      );

      if (quote === undefined) {
        interaction.followUp({
          content: "❌ Could not find quote"
        });

        return;
      }

      embed.addFields(
        {
          name: "Quote",
          value: toPascalCase(
            `${language} ${quoteLengthMap[result.quoteLength as 1 | 2 | 3 | 4]}`
          ),
          inline: true
        },
        {
          name: `${result.wpm} wpm`,
          value: `${result.acc}% acc`,
          inline: true
        },
        {
          name: `${result.rawWpm} raw`,
          value: `${result.consistency}% con`,
          inline: true
        },
        {
          name: "Quote Text",
          value: `Source: ${quote.source}\n\`\`\`\n${quote.text}\n\`\`\``,
          inline: false
        }
      );
    } else {
      interaction.followUp({
        content: "❌ Last result was not time, mode, or quote"
      });

      return;
    }

    interaction.followUp({
      embeds: [embed]
    });
  }
} as MonkeyTypes.Command;
