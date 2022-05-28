import type { MonkeyTypes } from "../types/types";
import {
  deleteRequest,
  getRequest,
  getRequestCount
} from "../dal/challenge-request";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  MessageSelectOptionData
} from "discord.js";
import {
  incrementApproved,
  incrementDenied
} from "../dal/challenge-request-stats";

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
    const message = await interaction.channel.messages.fetch(
      interaction.message.id
    );

    if (challengeSubmissionsChannel === undefined) {
      interaction.reply(
        "❌ The challenge submissions channel could not be found"
      );

      removeButtons(message);

      return;
    }

    const accepted = interaction.customId === "accept";

    const embed = message.embeds[0];

    if (embed === undefined) {
      interaction.reply("❌ The embed could not be found on the message");

      removeButtons(message);

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
      interaction.reply("❌ There seems to be data missing from the embed");

      removeButtons(message);

      return;
    }

    const challengeRoleID = challengeRolePing.replace(/[^0-9]/g, "");
    const userID = userPing.replace(/[^0-9]/g, "");
    const challengeMessageID = challengeMessageLink.split("/")[6];
    const member = await interaction.guild.members
      .fetch({ user: userID, cache: true })
      .catch(() => undefined);

    if (challengeMessageID === undefined || member === undefined) {
      interaction.reply(
        "❌ The challenge message id or member could not be found"
      );

      removeButtons(message);

      return;
    }

    const challengeMessage = await challengeSubmissionsChannel.messages
      .fetch(challengeMessageID, { cache: true })
      .catch(() => undefined);

    const challengeRequest = getRequest(userID, challengeMessageID);

    if (challengeRequest === undefined || challengeMessage === undefined) {
      interaction.reply(
        "❌ The challenge request or message could not be found"
      );

      deleteRequest(userID, challengeMessageID);
      updateChannel(message);
      removeButtons(message);

      return;
    }

    interaction.deferUpdate();

    const challengeRole = await interaction.guild.roles
      .fetch(challengeRoleID, { cache: true })
      .catch(() => undefined);

    if (accepted) {
      const newEmbeds = message.embeds;

      newEmbeds[0]?.addFields({
        name: "Accepted by",
        value: `${interaction.member.user}`
      });

      member
        .send(
          `✅ Challenge "${challengeRole?.name}" accepted! You will be given the role shortly.`
        )
        .catch(() => {
          challengeMessage.reply(
            `✅ Challenge "${challengeRole?.name}" accepted! You will be given the role shortly.`
          );
        });

      member.roles.add(challengeRoleID);

      message.edit({
        embeds: newEmbeds,
        components: []
      });

      deleteRequest(userID, challengeMessageID);
      updateChannel(message);
      incrementApproved(interaction.member.user.id);
    } else {
      const row = new MessageActionRow();

      const declineReasonSelectMenu = new MessageSelectMenu()
        .setCustomId("declineReason")
        .setPlaceholder("Pick a reason")
        .setMinValues(1)
        .setMaxValues(declineReasonOptions.length)
        .setOptions(declineReasonOptions);

      row.addComponents(declineReasonSelectMenu);

      await message.edit({
        embeds: message.embeds,
        components: [row]
      });

      const declineReasonInteraction = await client.awaitMessageComponent(
        interaction.channel,
        (i) =>
          i.customId === "declineReason" &&
          i.user.id === interaction.user.id &&
          i.message.id === message.id,
        "SELECT_MENU"
      );

      if (declineReasonInteraction === undefined) {
        // interaction.editReply({
        //   content: "❌ The decline reason selection menu timed out",
        //   components: []
        // });

        const approvalRow = new MessageActionRow();

        const acceptButton = new MessageButton()
          .setCustomId("accept")
          .setLabel("Accept")
          .setStyle("SUCCESS")
          .setDisabled(false);

        const declineButton = new MessageButton()
          .setCustomId("decline")
          .setLabel("Decline")
          .setStyle("DANGER")
          .setDisabled(false);

        approvalRow.addComponents(acceptButton, declineButton);

        message.edit({
          embeds: message.embeds,
          components: [row]
        });

        return;
      }

      const declineReasons = declineReasonInteraction.values.map(
        (reason) =>
          declineReasonOptions.find((option) => option.value === reason)
            ?.description
      );

      declineReasonInteraction.deferUpdate();

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
          `❌ Challenge "${
            challengeRole?.name
          }" declined with reasons:\n${declineReasons.join("\n")}`
        )
        .catch(() => {
          challengeMessage.reply(
            `❌ Challenge "${
              challengeRole?.name
            }" declined with reasons:\n${declineReasons.join("\n")}`
          );
        });

      removeButtons(message);

      deleteRequest(userID, challengeMessageID);
      updateChannel(message);
      incrementDenied(interaction.member.user.id);
    }
  }
} as MonkeyTypes.Event<"interactionCreate">;

async function updateChannel(message: Message): Promise<void> {
  if (message.channel.type === "GUILD_TEXT") {
    message.channel.edit({
      name: `${await getRequestCount()}-cs-mods`
    });
  }
}

function removeButtons(message: Message): void {
  message.edit({
    embeds: message.embeds,
    components: []
  });
}
