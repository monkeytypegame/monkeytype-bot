import type { MonkeyTypes } from "../../types/types";
import { exec } from "child_process";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";

export default {
  name: "restart-db",
  description: "Restart the MongoDB database",
  category: "Dev",
  needsPermissions: true,
  run: async (interaction, client) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder()
        .setCustomId("restartDBYes")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId("restartDBNo")
        .setLabel("No")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false)
    ]);

    const message = await interaction.reply({
      content: "Are you sure?",
      fetchReply: true,
      components: [row]
    });

    const buttonInteraction = await client.awaitMessageComponent(
      interaction.channel,
      (i) =>
        message.id === i.message.id &&
        i.user.id === interaction.user.id &&
        ["restartDBYes", "restartDBNo"].includes(i.customId),
      ComponentType.Button
    );

    if (buttonInteraction === undefined) {
      interaction.followUp("❌ Timed out.");

      return;
    }

    if (buttonInteraction.customId === "restartDBYes") {
      exec("systemctl restart mongod", (error, _, stderr) => {
        if (error) {
          console.log(error);

          buttonInteraction.reply(`An error occurred:\n\`\`\`${error}\`\`\``);
        } else if (stderr) {
          console.log(stderr);

          buttonInteraction.reply(`An error occurred:\n\`\`\`${stderr}\`\`\``);
        } else {
          buttonInteraction.reply("Restart command sent.");
        }
      });
    } else if (buttonInteraction.customId === "restartDBNo") {
      buttonInteraction.reply("❌ Cancelled");
    }
  }
} as MonkeyTypes.Command;
