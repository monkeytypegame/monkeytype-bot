import { Command, RolesEnum } from "../../interfaces/Command";
import { exec } from "child_process";
import {
  InteractionCollector,
  MessageActionRow,
  MessageButton
} from "discord.js";

export default {
  name: "restart-db",
  description: "Restart the MongoDB database",
  category: "Dev",
  roles: [, RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction, client) => {
    try {
      const message = await interaction.reply({
        content: "Are you sure?",
        fetchReply: true,
        components: [
          new MessageActionRow().addComponents([
            new MessageButton()
              .setCustomId("restartDBYes")
              .setLabel("Yes")
              .setEmoji("✅")
              .setStyle("SUCCESS")
              .setDisabled(false),
            new MessageButton()
              .setCustomId("restartDBNo")
              .setLabel("No")
              .setEmoji("❌")
              .setStyle("DANGER")
              .setDisabled(false)
          ])
        ]
      });

      const collector = new InteractionCollector(client, {
        channel: interaction.channel === null ? undefined : interaction.channel,
        componentType: "BUTTON",
        dispose: true,
        message,
        time: 60000,
        interactionType: "MESSAGE_COMPONENT",
        max: 1
      });

      collector.on("collect", (buttonInteraction) => {
        if (!buttonInteraction.isButton()) return;

        if (buttonInteraction.customId === "restartDBYes") {
          interaction.channel?.send("Sending command...");

          exec("systemctl restart mongod", (error, _, stderr) => {
            if (error) {
              console.log(error);

              buttonInteraction.reply(
                `An error occurred:\n\`\`\`${error}\`\`\``
              );
            } else if (stderr) {
              console.log(stderr);

              buttonInteraction.reply(
                `An error occurred:\n\`\`\`${stderr}\`\`\``
              );
            } else {
              buttonInteraction.reply("Restart command sent.");
            }
          });
        } else if (buttonInteraction.customId === "restartDBNo") {
          buttonInteraction.reply(":x: Cancelled");
        }

        collector.emit("end");
      });
    } catch (err) {
      console.log(err);

      interaction.followUp(`An error occurred:\n\`\`\`${err}\`\`\``);
    }
  }
} as Command;
