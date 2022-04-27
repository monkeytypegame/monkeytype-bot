/** @format */

import { Event } from "../interfaces/Event";

export default {
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isCommand() && interaction.channel?.type !== "DM") {
      const commandName = interaction.commandName;

      const command = client.commands.get(commandName);

      if (command === undefined) {
        interaction.reply("Could not find this command.");

        return;
      }

      if (
        !client.permissionsAdded.has(interaction.guild?.id ?? "") &&
        command.name !== "unlock-commands"
      ) {
        interaction.reply(
          `:x: Commands have not been unlocked for this server.\nServer owner must run /unlock-commands to unlock commands`
        );

        return;
      }

      console.log(`Running command "${command.name}"`);
      command.run(interaction, client);
    } else if (interaction.isButton()) {
      console.log(`Button clicked "${interaction.customId}"`);
    }
  }
} as Event<"interactionCreate">;
