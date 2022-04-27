/** @format */

import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../interfaces/Command";

export default {
  name: "unlock-commands",
  description: "Unlock commands",
  category: "Dev",
  needsPermissions: true,
  run: async (interaction, client) => {
    if (interaction.guild?.ownerId !== interaction.user.id) {
      interaction.reply(
        ":x: You must be the server owner to run this command."
      );

      return;
    }

    if (client.permissionsAdded.has(interaction.guild?.id ?? "")) {
      interaction.reply(":x: Permissions have already been set up.");

      return;
    }

    const embed = client.embed({
      title: "Unlock Commands",
      description:
        "The following commands should have their permissions set up (and should NOT be available to everyone) in Server Settings > Integrations before continuing.",
      fields: client.commands
        .filter((cmd) => cmd.needsPermissions ?? false)
        .map((cmd) => ({
          name: cmd.name,
          value: cmd.description,
          inline: false
        })),
      color: 0xff0000
    });

    const row = new MessageActionRow();

    const confirmButton = new MessageButton()
      .setCustomId("unlock")
      .setLabel("Unlock Commands")
      .setStyle("DANGER")
      .setDisabled(false);

    row.addComponents(confirmButton);

    await interaction.reply({ embeds: [embed], components: [row] });

    const buttonInteraction = await interaction.channel?.awaitMessageComponent({
      componentType: "BUTTON",
      dispose: true,
      time: 900000,
      filter: (i) => i.user.id === interaction.user.id
    });

    if (buttonInteraction === undefined) {
      interaction.followUp("15 minutes has passed. Please try again.");

      return;
    }

    client.permissionsAdded.add(interaction.guild?.id ?? "");

    buttonInteraction.reply("Commands have been unlocked.");
  }
} as Command;
