import { MessageActionRow, MessageButton } from "discord.js";
import { getUser, createUser, setUser } from "../../functions/banana";
import { randomInteger } from "../../functions/random";
import { Client } from "../../structures/client";
import type { MonkeyTypes } from "../../types/types";

type Choice = "rock" | "paper" | "scissors";

const choices: [Choice, Choice, Choice] = ["rock", "paper", "scissors"];

const choiceToEmoji: { [key in Choice]: string } = {
  rock: "✊",
  paper: "✋",
  scissors: "✌"
};

const outcomeStringMap = {
  win: "won",
  tie: "tied",
  loss: "lost"
};

const outcomeColorMap = {
  win: 0x41fd5f,
  tie: 0xede009,
  loss: 0xfd4141
};

export default {
  name: "banana-rps",
  description: "Play best of 3 rock paper scissors",
  category: "Banana",
  options: [
    {
      name: "amount",
      description: "The amount of bananas to bet",
      type: "INTEGER",
      required: true
    }
  ],
  run: async (interaction, client) => {
    const amount = interaction.options.getInteger("amount", true);

    const authorBananaEntry =
      getUser(interaction.user.id) ?? createUser(interaction.user.id);

    const botBananaEntry =
      getUser(client.user.id) ?? createUser(client.user.id);

    if (amount < 1) {
      interaction.reply("❌ You must bet at least 1 banana.");

      return;
    }

    if (authorBananaEntry.balance < amount) {
      interaction.reply("❌ You do not have enough bananas to bet.");

      return;
    }

    if (client.currentlyPlaying.has(interaction.user.id)) {
      interaction.reply("❌ You are already playing.");

      return;
    }

    client.currentlyPlaying.add(interaction.user.id);

    const embed = client.embed(
      {
        title: "Rock Paper Scissors",
        thumbnail: {
          url: Client.thumbnails.raisedHand
        },
        color: 0xede009,
        fields: [
          {
            name: "Round",
            value: "1",
            inline: false
          },
          {
            name: interaction.user.username,
            value: "Choose your gesture",
            inline: true
          },
          {
            name: client.user.username,
            value: "❔",
            inline: true
          }
        ]
      },
      interaction.user
    );

    const row = new MessageActionRow();

    const rockButton = new MessageButton()
      .setCustomId("rock")
      .setLabel("Rock")
      .setEmoji("✊")
      .setStyle("PRIMARY")
      .setDisabled(false);

    const paperButton = new MessageButton()
      .setCustomId("paper")
      .setLabel("Paper")
      .setEmoji("✋")
      .setStyle("PRIMARY")
      .setDisabled(false);

    const scissorsButton = new MessageButton()
      .setCustomId("scissors")
      .setLabel("Scissors")
      .setEmoji("✌")
      .setStyle("PRIMARY")
      .setDisabled(false);

    row.addComponents(rockButton, paperButton, scissorsButton);

    const replyMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    let wins = 0,
      losses = 0;

    async function game(round: number): Promise<void> {
      const buttonInteraction = await client.awaitMessageComponent(
        interaction.channel,
        (i) =>
          replyMessage.id === i.message.id &&
          i.user.id === interaction.user.id &&
          ["rock", "paper", "scissors"].includes(i.customId),
        "BUTTON"
      );

      async function finishRound(): Promise<void> {
        if (round !== 3) {
          const roundField = embed.fields[0];

          round++;

          if (roundField !== undefined) {
            roundField.value = round.toString();
          }

          await interaction.editReply({ embeds: [embed] });

          game(round);
        } else {
          client.currentlyPlaying.delete(interaction.user.id);

          const outcome =
            wins > losses ? "win" : wins === losses ? "tie" : "loss";

          const outcomeString = outcomeStringMap[outcome];

          embed.setColor(outcomeColorMap[outcome]);

          embed.fields.shift();

          if (outcome === "win") {
            authorBananaEntry.balance += amount;
            botBananaEntry.balance -= amount;
          } else if (outcome === "loss") {
            authorBananaEntry.balance -= amount;
            botBananaEntry.balance += amount;
          }

          embed.setDescription(
            `${
              embed.description ?? ""
            }\n\nYou ${outcomeString} ${amount} bananas!\nNew balance: ${
              authorBananaEntry.balance
            }`
          );

          setUser(interaction.user.id, authorBananaEntry);
          setUser(client.user.id, botBananaEntry);

          interaction.editReply({ embeds: [embed], components: [] });
        }
      }

      if (buttonInteraction === undefined) {
        losses++;

        embed.setDescription(
          `${embed.description ?? ""}\nRound ${round}: Timed Out 🔴 Loss`
        );

        await finishRound();

        return;
      }

      buttonInteraction.deferUpdate();

      const choice = <Choice>buttonInteraction.customId;

      const random = randomInteger(0, 3);

      const computerChoice = choices[random] ?? "rock";

      const win =
        (choice === "paper" && computerChoice === "rock") ||
        (choice === "scissors" && computerChoice === "paper") ||
        (choice === "rock" && computerChoice === "scissors");

      const result = choice === computerChoice ? "tie" : win ? "win" : "loss";

      const choiceEmoji = choiceToEmoji[choice];
      const computerChoiceEmoji = choiceToEmoji[computerChoice];

      if (result === "win") {
        wins++;

        embed.setDescription(
          `${
            embed.description ?? ""
          }\nRound ${round}: ${choiceEmoji} vs ${computerChoiceEmoji}   🟢 Win`
        );
      } else if (result === "loss") {
        losses++;

        embed.setDescription(
          `${
            embed.description ?? ""
          }\nRound ${round}: ${choiceEmoji} vs ${computerChoiceEmoji}   🔴 Loss`
        );
      } else if (result === "tie") {
        embed.setDescription(
          `${
            embed.description ?? ""
          }\nRound ${round}: ${choiceEmoji} vs ${computerChoiceEmoji}   🟠 Tie`
        );
      }

      const userField = embed.fields[1];

      const computerField = embed.fields[2];

      if (userField !== undefined && computerField !== undefined) {
        userField.value = choiceToEmoji[choice];

        computerField.value = choiceToEmoji[computerChoice];
      }

      await finishRound();
    }

    game(1);
  }
} as MonkeyTypes.Command;
