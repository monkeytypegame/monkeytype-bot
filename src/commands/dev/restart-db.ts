import type { MonkeyTypes } from "../../types/types";
import { exec } from "child_process";
import { MessageActionRow, MessageButton } from "discord.js";

export default {
  name: "restart-db",
  description: "Restart the MongoDB database",
  category: "Dev",
  needsPermissions: true,
  run: async (interaction, client) => {
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

    const buttonInteraction = await client.awaitMessageComponent(
      interaction.channel,
      (i) =>
        message.id === i.message.id &&
        i.user.id === interaction.user.id &&
        ["restartDBYes", "restartDBNo"].includes(i.customId),
      "BUTTON"
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
