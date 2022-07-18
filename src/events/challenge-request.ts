import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";
import { ObjectId } from "mongodb";
import { compareTwoStrings } from "string-similarity";
import { addRequest, getRequestCount } from "../dal/challenge-request";
import { Client } from "../structures/client";
import type { MonkeyTypes } from "../types/types";

type FailReasons = "badFormat" | "invalidChallenge" | "noProof";

function fail(message: Message<boolean>, reason: FailReasons): void {
  let string = "❌ Something went wrong";
  if (reason === "badFormat") {
    string = "❌ Please use the correct format to submit a challenge:";
    string += "```[bot ping]\n[role ping or role name]\n";
    string += "[proof (any amount separated by new lines)]```";
    string += "for example:";
    string += "```@George\nSimp\nhttps://www.imgur.com/...```";
    string += "or";
    string += "```@George\nAccuracy Expert\n(attached screenshot)```";
  } else if (reason === "invalidChallenge") {
    string = "❌ Challenge role not found";
  } else if (reason === "noProof") {
    string = "❌ Please provide proof that you've completed the challenge";
  }
  message.channel.send(string);
}

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (
      message.author.bot ||
      !message.guild ||
      !message.member ||
      message.channelId !==
        (await client.getChannel("challengeSubmissions"))?.id ||
      !message.mentions.has(client.user)
    ) {
      return;
    }

    // User pinged the bot in the challenge-submissions channel

    const [botPing, roleName, ...proof] = message.content
      .split("\n")
      .map((s) => s.trim());

    if (!botPing || !roleName) {
      fail(message, "badFormat");

      return;
    }

    if (message.attachments.size > 0) {
      //get all attachments
      proof.push(...message.attachments.map((a) => a.url));
    }

    if (!proof || proof.length === 0) {
      fail(message, "noProof");

      return;
    }

    const foundChallengeRole = Object.entries(client.clientOptions.challenges)
      .map((challenge) => ({
        name: challenge[0],
        id: challenge[1],
        similarity: compareTwoStrings(challenge[0], roleName)
      }))
      .sort((a, b) => b.similarity - a.similarity)[0];

    if (foundChallengeRole === undefined) {
      fail(message, "invalidChallenge");

      return;
    }

    //add "did you mean" foundChallengeRole.name confirmation
    const exactMatch = compareTwoStrings(foundChallengeRole.name, roleName);

    if (exactMatch < 1) {
      const confirmationRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle(ButtonStyle.Success)
            .setDisabled(false),
          new ButtonBuilder()
            .setCustomId("no")
            .setLabel("No")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(false)
        );

      const m = await message.channel.send({
        content: `❓ Did you mean ${foundChallengeRole.name}?`,
        components: [confirmationRow]
      });

      const confirmationInteraction = await client.awaitMessageComponent(
        message.channel,
        (i) =>
          i.user.id === message.author.id &&
          ["yes", "no"].includes(i.customId) &&
          i.channel?.id === message.channel.id,
        ComponentType.Button
      );

      confirmationInteraction?.deferUpdate();

      m.delete();

      if (
        confirmationInteraction === undefined ||
        confirmationInteraction.customId === "no"
      ) {
        message.react("❌");

        return;
      }
    }

    await addRequest({
      _id: new ObjectId(),
      userID: message.author.id,
      messageID: message.id,
      challengeRoleID: foundChallengeRole.id,
      proof,
      timestamp: Date.now()
    });

    message.react("📨");

    const challengeSubmissionsModsChannel = await client.getChannel(
      "challengeSubmissionsMods"
    );

    if (challengeSubmissionsModsChannel === undefined) {
      return;
    }

    const challengeRole = await message.guild.roles.cache.get(
      foundChallengeRole.id
    );

    if (challengeRole === undefined) {
      return;
    }

    const embed = client.embed(
      {
        title: "Challenge Request",
        thumbnail: {
          url: Client.thumbnails.trophy
        },
        color: 0xe2b714,
        fields: [
          {
            name: "Name",
            value: challengeRole.toString(),
            inline: true
          },
          {
            name: "User",
            value: message.author.toString(),
            inline: true
          },
          {
            name: "Proof",
            value: proof.join("\n"),
            inline: false
          },
          {
            name: "Message Link",
            value: message.url,
            inline: false
          }
        ]
      },
      message.author
    );

    const approvalRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("accept")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId("decline")
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false)
    );

    challengeSubmissionsModsChannel.send({
      embeds: [embed],
      components: [approvalRow],
      files: Array.from(message.attachments.values())
    });

    challengeSubmissionsModsChannel.edit({
      name: `${await getRequestCount()}-cs-mods`
    });
  }
} as MonkeyTypes.Event<"messageCreate">;
