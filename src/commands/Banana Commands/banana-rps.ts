/** @format */

import { ButtonInteraction, MessageActionRow, MessageButton } from "discord.js";
import { getUser, createUser, setUser } from "../../functions/banana";
import { Command } from "../../interfaces/Command";

const currentlyPlaying = new Set<string>();

type Choice = "rock" | "paper" | "scissors";

const choices: [Choice, Choice, Choice] = ["rock", "paper", "scissors"];

const choiceToEmoji: { [key in Choice]: string } = {
  rock: "✊",
  paper: "✋",
  scissors: "✌"
};

export default {
  name: "banana-rps",
  description: "Play rock paper scissors",
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
      interaction.reply(":x: You must bet at least 1 banana.");
      return;
    }

    if (authorBananaEntry.balance < amount) {
      interaction.reply(":x: You do not have enough bananas to bet.");
      return;
    }

    if (currentlyPlaying.has(interaction.user.id)) {
      interaction.reply(":x: You are already playing.");
      return;
    }

    currentlyPlaying.add(interaction.user.id);

    const embed = client.embed(
      {
        title: "Rock Paper Scissors",
        thumbnail: {
          url: "https://static.thenounproject.com/png/477919-200.png"
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
            value: ":grey_question:",
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

    const interactionReply = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const filter = (buttonInteraction: ButtonInteraction<"cached">) => {
      return (
        buttonInteraction.user.id === interaction.user.id &&
        ["rock", "paper", "scissors"].includes(buttonInteraction.customId)
      );
    };

    let wins = 0,
      losses = 0;

    function game(round: number): void {
      const collector = interaction.channel?.createMessageComponentCollector({
        filter,
        time: 60000,
        componentType: "BUTTON",
        dispose: true,
        max: 1,
        message: interactionReply
      });

      if (collector === undefined) {
        interaction.followUp(":x: Something went wrong.");
        return;
      }

      collector.on("collect", async (buttonInteraction) => {
        buttonInteraction.reply({
          ephemeral: true,
          content: `:white_check_mark: You chose ${buttonInteraction.customId}`
        });

        const choice = <Choice>buttonInteraction.customId;

        const random = Math.floor(Math.random() * 3);

        const computerChoice = choices[random] ?? "rock";

        const win =
          (choice === "paper" && computerChoice === "rock") ||
          (choice === "scissors" && computerChoice === "paper") ||
          (choice === "rock" && computerChoice === "scissors");

        const result = choice === computerChoice ? "tie" : win ? "win" : "loss";

        if (result === "win") {
          wins++;

          embed.setDescription(`You won round ${round}! ${wins}-${losses}`);

          round++;
        } else if (result === "loss") {
          losses++;

          embed.setDescription(`You lost round ${round}! ${wins}-${losses}`);

          round++;
        } else if (result === "tie") {
          embed.setDescription(`You tied! Try again! ${wins}-${losses}`);
        }

        const roundField = embed.fields[0];

        const userField = embed.fields[1];

        const computerField = embed.fields[2];

        if (
          userField !== undefined &&
          computerField !== undefined &&
          roundField !== undefined
        ) {
          roundField.value = round.toString();

          userField.value = choiceToEmoji[choice];

          computerField.value = choiceToEmoji[computerChoice];
        }

        await interaction.editReply({ embeds: [embed] });

        collector.stop("recorded");
      });

      collector.on("end", (collected, reason) => {
        if (
          round <= 3 &&
          !hasWon(wins) &&
          losses !== 2 &&
          collected.size > 0 &&
          (reason === "recorded" || reason === "limit")
        ) {
          game(round);
        } else {
          currentlyPlaying.delete(interaction.user.id);

          const won =
            round === 4 || wins === 2 || losses === 2 ? hasWon(wins) : false;

          embed.setColor(won ? 0x41fd5f : 0xfd4141);

          embed.fields.shift();

          if (won) {
            authorBananaEntry.balance += amount;
            botBananaEntry.balance -= amount;
          } else {
            authorBananaEntry.balance -= amount;
            botBananaEntry.balance += amount;
          }

          const wonString = won ? "won" : "lost";

          const countString = amount === 1 ? "banana" : "bananas";

          embed.setDescription(
            embed.description +
              `\nYou ${wonString}! ${
                won ? `${client.user.username} busted` : "Busted"
              }!\nYou ${wonString} ${amount} ${countString}!\nNew balance: ${
                authorBananaEntry.balance
              }`
          );

          setUser(interaction.user.id, authorBananaEntry);
          setUser(client.user.id, botBananaEntry);

          interaction.editReply({ embeds: [embed] });
        }
      });
    }

    game(1);
  }
} as Command;

function hasWon(wins: number): boolean {
  return wins >= 2;
}
