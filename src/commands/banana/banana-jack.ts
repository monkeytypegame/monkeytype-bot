/** @format */

import type { MonkeyTypes } from "../../types/types";
import { createUser, getUser, setUser } from "../../functions/banana";
import { MessageActionRow, MessageButton } from "discord.js";
import { randomInteger } from "../../functions/random";

const suits = ["♥", "♣", "♦", "♠"];
const values = [
  "A",
  "K",
  "Q",
  "J",
  "10",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2"
];

interface Card {
  suit: typeof suits[number];
  value: typeof values[number];
}

export default {
  name: "banana-jack",
  description: "Blackjack with bananas!",
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
      interaction.reply("❌ You don't have enough bananas to bet.");

      return;
    }

    if (client.currentlyPlaying.has(interaction.user.id)) {
      interaction.reply("❌ You are already playing.");

      return;
    }

    client.currentlyPlaying.add(interaction.user.id);

    const dealerCards: Card[] = [];
    const playerCards: Card[] = [];

    let gameOver = false;

    const deck = shuffleDeck(createDeck());

    dealerCards.push(getNextCard(deck), getNextCard(deck));
    playerCards.push(getNextCard(deck), getNextCard(deck));

    const embed = client.embed(
      {
        title: "Bananajack",
        thumbnail: {
          url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/joker_1f0cf.png"
        },
        color: 0xede009,
        fields: [
          {
            name: interaction.user.username,
            value: `${playerCards
              .map((card) => toString(card))
              .join(" ")}\nTotal: ${getScore(playerCards)}`,
            inline: true
          },
          {
            name: client.user.username,
            value: `${dealerCards
              .map((card) => toString(card))
              .join(" ")}\nTotal: ${getScore(dealerCards)}`,
            inline: true
          },
          {
            name: "Details",
            value: "K, Q, J = 10 | A = 1 or 11\nH - Hit | S - Stand",
            inline: false
          }
        ]
      },
      interaction.user
    );

    const row = new MessageActionRow();

    const hitButton = new MessageButton()
      .setCustomId("hit")
      .setLabel("Hit")
      .setStyle("PRIMARY")
      .setDisabled(false);

    const standButton = new MessageButton()
      .setCustomId("stand")
      .setLabel("Stand")
      .setStyle("PRIMARY")
      .setDisabled(false);

    row.addComponents(hitButton, standButton);

    const replyMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    while (!gameOver) {
      const playerField = embed.fields[0];
      const dealerField = embed.fields[1];

      if (playerField === undefined || dealerField === undefined) {
        console.log("Field is undefined");

        return;
      }

      const buttonInteraction = await client.awaitMessageComponent(
        interaction.channel,
        (i) =>
          replyMessage.id === i.message.id &&
          i.user.id === interaction.user.id &&
          ["hit", "stand"].includes(i.customId),
        "BUTTON"
      );

      if (buttonInteraction === undefined) {
        gameOver = true;
        break;
      }

      const hitOrStand = buttonInteraction.customId as "hit" | "stand";

      if (hitOrStand === "hit") {
        playerCards.push(getNextCard(deck));
      } else {
        gameOver = true;
      }

      playerField.value = `${playerCards
        .map((card) => toString(card))
        .join(" ")}\nTotal: ${getScore(playerCards)}`;

      dealerField.value = `${dealerCards
        .map((card) => toString(card))
        .join(" ")}\nTotal: ${getScore(dealerCards)}`;

      await interaction.editReply({ embeds: [embed], components: [row] });

      buttonInteraction.deferUpdate();

      if (checkForEndOfGame(dealerCards, playerCards)) {
        gameOver = true;
      }
    }

    const winner = getWinner(dealerCards, playerCards);

    if (winner === "player") {
      authorBananaEntry.balance += amount;
      botBananaEntry.balance -= amount;

      embed.setDescription(
        `You won! ${client.user.username} busted! You won ${amount} bananas! You now have ${authorBananaEntry.balance} bananas!`
      );
      embed.setColor(0x41fd5f);
    } else if (winner === "dealer") {
      authorBananaEntry.balance -= amount;
      botBananaEntry.balance += amount;

      embed.setDescription(
        `You lost! Busted! You lost ${amount} bananas! You now have ${authorBananaEntry.balance} bananas!`
      );
      embed.setColor(0xfd5f41);
    } else if (winner === "tie") {
      embed.setDescription("You tied! Your bananas are returned to you.");
      embed.setColor(0xfd9d41);
    }

    await interaction.editReply({ embeds: [embed], components: [] });

    setUser(interaction.user.id, authorBananaEntry);
    setUser(client.user.id, botBananaEntry);

    client.currentlyPlaying.delete(interaction.user.id);
  }
} as MonkeyTypes.Command;

function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit,
        value
      });
    }
  }

  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  for (const [i, card] of deck.entries()) {
    const j = randomInteger(0, i + 1);

    const randomCard = deck[j];

    if (randomCard === undefined) {
      console.log("Card is undefined");

      return deck;
    }

    deck[i] = randomCard;
    deck[j] = card;
  }

  return deck;
}

function getCardNumericValue(card: Card): number {
  switch (card.value) {
    case "A":
      return 11;
    case "K":
    case "Q":
    case "J":
      return 10;
    default:
      return +card.value;
  }
}

function getNextCard(deck: Card[]): Card {
  return deck.shift() as Card;
}

function getScore(hand: Card[]): number {
  let score = 0;

  const hasAce = hand.some((card) => card.value === "A");

  for (const card of hand) {
    score += getCardNumericValue(card);
  }

  if (hasAce && score + 10 <= 21) {
    return score + 10;
  }

  return score;
}

function toString(card: Card): string {
  return `\`${card.value} ${card.suit}\``;
}

function checkForEndOfGame(dealerCards: Card[], playerCards: Card[]): boolean {
  return getScore(dealerCards) >= 17 || getScore(playerCards) >= 21;
}

function getWinner(
  dealerCards: Card[],
  playerCards: Card[]
): "player" | "dealer" | "tie" {
  const dealerScore = getScore(dealerCards);
  const playerScore = getScore(playerCards);

  if (playerScore > 21) {
    return "dealer";
  } else if (dealerScore > 21) {
    return "player";
  } else if (playerScore > dealerScore) {
    return "player";
  } else if (playerScore < dealerScore) {
    return "dealer";
  } else {
    return "tie";
  }
}
