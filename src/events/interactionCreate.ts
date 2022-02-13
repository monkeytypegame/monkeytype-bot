import { Event } from "../interfaces/Event";

export default {
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isCommand()) {
      const commandName = interaction.commandName;

      const command = client.commands.get(commandName);

      if (command === undefined) return;

      command.run(interaction, client);
    } else if (interaction.isButton()) {
      console.log(`Button clicked ${interaction.customId}`);
    }
  }
} as Event<"interactionCreate">;
