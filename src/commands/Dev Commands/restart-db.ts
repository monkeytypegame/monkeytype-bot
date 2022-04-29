/** @format */

import { Command } from "../../interfaces/Command";
import { exec } from "child_process";
import { MessageActionRow, MessageButton } from "discord.js";

export default {
  name: "restart-db",
  description: "Restart the MongoDB database",
  category: "Dev",
  needsPermissions: true,
  run: async (interaction) => {
    const message = await interaction.reply({
      content: "Are you sure?",
      fetchReply: true,
      components: [
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("restartDBYes")
            .setLabel("Yes")
            .setStyle("SUCCESS")
            .setDisabled(false),
          new MessageButton()
            .setCustomId("restartDBNo")
            .setLabel("No")
            .setStyle("DANGER")
            .setDisabled(false)
        ])
      ]
    });

    if (interaction.channel === null) {
      console.log("Channel is null");

      return;
    }

    const buttonInteraction = await interaction.channel?.awaitMessageComponent({
      componentType: "BUTTON",
      dispose: true,
      filter: (i) =>
        message.id === i.message.id &&
        i.user.id === interaction.user.id &&
        ["restartDBYes", "restartDBNo"].includes(i.customId),
      time: 60000
    });

    if (buttonInteraction.customId === "restartDBYes") {
      interaction.channel?.send("Sending command...");

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
      buttonInteraction.reply(":x: Cancelled");
    }
  }
} as Command;
