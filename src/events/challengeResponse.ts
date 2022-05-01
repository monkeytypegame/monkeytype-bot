/** @format */

import { Event } from "../interfaces/Event";
import {
  deleteRequest,
  getRequest,
  getRequestCount
} from "../functions/challengeRequest";
import {
  MessageActionRow,
  MessageSelectMenu,
  MessageSelectOptionData
} from "discord.js";

const declineReasonOptions: MessageSelectOptionData[] = [
  {
    label: "Invalid Proof",
    description: "The proof (images, videos) you provided were invalid",
    value: "invalidProof"
  },
  {
    label: "Requirements Not Met",
    description: "Your result did not meet the challenge requirements",
    value: "requirementsNotMet"
  },
  {
    label: "High AFK",
    description: "Your time away from keyboard was too large",
    value: "highAfk"
  },
  {
    label: "Invalid Challenge",
    description:
      "Challenge doesn't exist or proof doesn't apply to the requested challenge",
    value: "invalidChallenge"
  },
  {
    label: "Other",
    description: "Contact a moderator for more info",
    value: "other"
  }
];

export default {
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (
      !interaction.isButton() ||
      !interaction.guild ||
      !interaction.member ||
      !interaction.channel ||
      interaction.channelId !==
        (await client.getChannel("challengeSubmissionsMods"))?.id ||
      !["accept", "decline"].includes(interaction.customId)
    ) {
      return;
    }

    const challengeSubmissionsChannel = await client.getChannel(
      "challengeSubmissions"
    );

    if (challengeSubmissionsChannel === undefined) {
      interaction.reply(
        ":x: The challenge submissions channel could not be found"
      );

      return;
    }

    const accepted = interaction.customId === "accept";

    const message = await interaction.channel.messages.fetch(
      interaction.message.id
    );

    const embed = message.embeds[0];

    if (embed === undefined) {
      interaction.reply(":x: The embed could not be found on the message");

      return;
    }

    const challengeRolePing = embed.fields[0]?.value;
    const userPing = embed.fields[1]?.value;
    const proof = embed.fields[2]?.value;
    const challengeMessageLink = embed.fields[3]?.value;

    if (
      challengeRolePing === undefined ||
      userPing === undefined ||
      proof === undefined ||
      challengeMessageLink === undefined
    ) {
      interaction.reply(":x: There seems to be data missing from the embed");

      return;
    }

    const challengeRoleID = challengeRolePing.replace(/[^0-9]/g, "");
    const userID = userPing.replace(/[^0-9]/g, "");
    const challengeMessageID = challengeMessageLink.split("/")[6];
    const member = await interaction.guild.members
      .fetch({ user: userID, cache: true, force: true })
      .catch(() => undefined);

    if (challengeMessageID === undefined || member === undefined) {
      interaction.reply(
        ":x: The challenge message id or member could not be found"
      );

      return;
    }

    const challengeMessage = await challengeSubmissionsChannel.messages
      .fetch(challengeMessageID, { cache: true, force: true })
      .catch(() => undefined);

    const challengeRequest = getRequest(userID, challengeMessageID);

    if (challengeRequest === undefined || challengeMessage === undefined) {
      interaction.reply(
        ":x: The challenge request or message could not be found"
      );

      return;
    }

    const challengeRole = await interaction.guild.roles
      .fetch(challengeRoleID, { cache: true, force: true })
      .catch(() => undefined);

    if (accepted) {
      const newEmbeds = message.embeds;
      newEmbeds[0]?.addFields({
        name: "Accepted by",
        value: `${interaction.member.user}`
      });

      member
        .send(
          `:white_check_mark: Challenge "${challengeRole?.name}" accepted! You will be given the role shortly.`
        )
        .catch(() => {
          challengeMessage.reply(
            `:white_check_mark: Challenge "${challengeRole?.name}" accepted! You will be given the role shortly.`
          );
        });

      member.roles.add(challengeRoleID);

      message.edit({
        embeds: newEmbeds,
        components: []
      });

      deleteRequest(userID, challengeMessageID);
    } else {
      const row = new MessageActionRow();

      const declineReasonSelectMenu = new MessageSelectMenu()
        .setCustomId("declineReason")
        .setPlaceholder("Pick a reason")
        .setMinValues(1)
        .setMaxValues(declineReasonOptions.length)
        .setOptions(declineReasonOptions);

      row.addComponents(declineReasonSelectMenu);

      const replyMessage = await interaction.reply({
        content: "Select declination reasons below:",
        components: [row],
        fetchReply: true
      });

      const declineReasonInteraction = await client.awaitMessageComponent(
        interaction.channel,
        (i) =>
          i.customId === "declineReason" &&
          i.user.id === interaction.user.id &&
          i.message.id === replyMessage.id,
        "SELECT_MENU"
      );

      if (declineReasonInteraction === undefined) {
        interaction.editReply({
          content: ":x: The decline reason selection menu timed out",
          components: []
        });

        return;
      }

      interaction.deleteReply();

      const declineReasons = declineReasonInteraction.values.map(
        (reason) =>
          declineReasonOptions.find((option) => option.value === reason)
            ?.description
      );

      const newEmbeds = message.embeds;
      newEmbeds[0]?.addFields({
        name: "Declined by",
        value: `<@${interaction.member.user.id}>`
      });

      newEmbeds[0]?.addFields({
        name: "Reasons",
        value: declineReasons.join("\n")
      });

      member
        .send(
          `:x: Challenge "${
            challengeRole?.name
          }" declined with reasons:\n${declineReasons.join("\n")}`
        )
        .catch(() => {
          challengeMessage.reply(
            `:x: Challenge "${
              challengeRole?.name
            }" declined with reasons:\n${declineReasons.join("\n")}`
          );
        });

      message.edit({
        embeds: newEmbeds,
        components: []
      });

      deleteRequest(userID, challengeMessageID);
    }

    if (message.channel.type === "GUILD_TEXT") {
      message.channel.edit({
        name: `${getRequestCount()}-cs-mods`
      });
    }
  }
} as Event<"interactionCreate">;
