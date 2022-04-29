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

const outcomeStringMap = {
  win: "won",
  tie: "tied",
  loss: "lost"
};

const outcomeColorMap = {
  win: 0x41fd5f,
  tie: 0x1e1e1e,
  loss: 0xfd4141
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
          url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/322/raised-hand_270b.png"
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

    const replyMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const filter = (i: ButtonInteraction<"cached">) => {
      return (
        replyMessage.id === i.message.id &&
        i.user.id === interaction.user.id &&
        ["rock", "paper", "scissors"].includes(i.customId)
      );
    };

    let wins = 0,
      losses = 0,
      ties = 0;

    async function game(round: number): Promise<void> {
      if (interaction.channel === null) {
        interaction.followUp(":x: Something went wrong.");

        return;
      }

      const buttonInteraction = await interaction.channel.awaitMessageComponent(
        {
          filter,
          time: 60000,
          componentType: "BUTTON",
          dispose: true
        }
      );

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

        embed.setDescription(
          `${
            embed.description ?? ""
          }\nYou won round ${round}! ${wins}-${losses}-${ties}`
        );
      } else if (result === "loss") {
        losses++;

        embed.setDescription(
          `${
            embed.description ?? ""
          }\nYou lost round ${round}! ${wins}-${losses}-${ties}`
        );
      } else if (result === "tie") {
        ties++;

        embed.setDescription(
          `${
            embed.description ?? ""
          }\nYou tied round ${round}! ${wins}-${losses}-${ties}`
        );
      }

      const userField = embed.fields[1];

      const computerField = embed.fields[2];

      if (userField !== undefined && computerField !== undefined) {
        userField.value = choiceToEmoji[choice];

        computerField.value = choiceToEmoji[computerChoice];
      }

      if (round !== 3) {
        const roundField = embed.fields[0];

        round++;

        if (roundField !== undefined) {
          roundField.value = round.toString();
        }

        await interaction.editReply({ embeds: [embed] });

        game(round);
      } else {
        currentlyPlaying.delete(interaction.user.id);

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

        const countString = amount === 1 ? "banana" : "bananas";

        embed.setDescription(
          `${
            embed.description ?? ""
          }\n\nYou ${outcomeString}!\nYou ${outcomeString} ${amount} ${countString}!\nNew balance: ${
            authorBananaEntry.balance
          }`
        );

        setUser(interaction.user.id, authorBananaEntry);
        setUser(client.user.id, botBananaEntry);

        interaction.editReply({ embeds: [embed], components: [] });
      }
    }

    game(1);
  }
} as Command;
