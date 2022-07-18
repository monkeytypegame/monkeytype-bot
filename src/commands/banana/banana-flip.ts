import { ApplicationCommandOptionType } from "discord.js";
import {
  createUser,
  getCoinFlips,
  getUser,
  setCoinFlips,
  setUser
} from "../../functions/banana";
import { randomBoolean } from "../../functions/random";
import { Client } from "../../structures/client";
import type { MonkeyTypes } from "../../types/types";

export default {
  name: "banana-flip",
  description: "Flip a coin and bet some bananas",
  category: "Banana",
  options: [
    {
      name: "guess",
      description: "The side of the coin to bet on",
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: "heads", value: "heads" },
        { name: "tails", value: "tails" }
      ]
    },
    {
      name: "amount",
      description: "The amount of bananas to bet",
      type: ApplicationCommandOptionType.Integer,
      required: false
    }
  ],
  run: async (interaction, client) => {
    const amount = interaction.options.getInteger("amount", false);

    const guess = interaction.options.getString("guess", false);

    if (
      (amount !== null && guess === null) ||
      (amount === null && guess !== null)
    ) {
      interaction.reply(
        "❌ You must specify both/neither an amount and a guess."
      );

      return;
    }

    const authorBananaEntry =
      getUser(interaction.user.id) ?? createUser(interaction.user.id);

    const botBananaEntry =
      getUser(client.user.id) ?? createUser(client.user.id);

    const coinFlips = getCoinFlips();

    if (amount === null && guess === null) {
      // get the last 10 flips and display them in an embed

      const coinFlipsSliced = coinFlips.slice(-10);

      setCoinFlips(coinFlipsSliced);

      const coinFlipsString =
        coinFlipsSliced.map((coinFlip) => coinFlip.toUpperCase()).join(" ") ||
        "None";

      const embed = client.embed(
        {
          title: "Last 10 Global Flips",
          thumbnail: {
            url: Client.thumbnails.slotMachine
          },
          color: 0xe2b714,
          description: coinFlipsString,
          fields: [
            {
              name: `${interaction.user.username}'s Available Balance`,
              value: `${authorBananaEntry.balance} bananas`,
              inline: true
            },
            {
              name: "Flip Wins",
              value: authorBananaEntry.flipWins.toString(),
              inline: true
            },
            {
              name: "Flip Losses",
              value: authorBananaEntry.flipLosses.toString(),
              inline: true
            }
          ]
        },
        interaction.user
      );

      interaction.reply({ embeds: [embed] });

      return;
    }

    // unnecessary but ts complains
    if (amount === null || guess === null) {
      return;
    }

    if (amount < 1) {
      interaction.reply("❌ You must bet at least 1 banana.");

      return;
    }

    if (authorBananaEntry.balance < amount) {
      interaction.reply("❌ You do not have enough bananas to bet.");

      return;
    }

    const result = randomBoolean() ? "heads" : "tails";

    coinFlips.push(result === "heads" ? "h" : "t");

    const coinFlipsSliced = coinFlips.slice(-10);

    const coinFlipsString = coinFlipsSliced
      .map((coinFlip) => coinFlip.toUpperCase())
      .join(" ");

    setCoinFlips(coinFlipsSliced);

    const isCorrect = result === guess;

    if (isCorrect) {
      authorBananaEntry.balance += amount;
      botBananaEntry.balance -= amount;
      authorBananaEntry.flipWins++;
    } else {
      authorBananaEntry.balance -= amount;
      botBananaEntry.balance += amount;
      authorBananaEntry.flipLosses++;
    }

    const countString = amount === 1 ? "banana" : "bananas";

    const embed = client.embed(
      {
        title: "Coin Flip",
        thumbnail: {
          url: isCorrect
            ? Client.thumbnails.banana
            : Client.thumbnails.crossMark
        },
        color: isCorrect ? 0x41fd5f : 0xfd4141,
        description: `It's ${result}! ${interaction.user.username} ${
          isCorrect ? "won" : "lost"
        } ${amount} ${countString}.`,
        fields: [
          {
            name: "Last 10 Global Flips",
            value: coinFlipsString,
            inline: false
          },
          {
            name: `${interaction.user.username}'s New Balance`,
            value: authorBananaEntry.balance.toString(),
            inline: false
          },
          {
            name: "Flip Wins",
            value: authorBananaEntry.flipWins.toString(),
            inline: true
          },
          {
            name: "Flip Losses",
            value: authorBananaEntry.flipLosses.toString(),
            inline: true
          }
        ]
      },
      interaction.user
    );

    interaction.reply({ embeds: [embed] });

    setUser(interaction.user.id, authorBananaEntry);
    setUser(client.user.id, botBananaEntry);
  }
} as MonkeyTypes.Command;
