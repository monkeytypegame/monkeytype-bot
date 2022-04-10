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

      if (command.roles !== undefined && command.roles.length !== 0) {
        const apiMember = interaction.member;

        if (apiMember === null || !interaction.guild) {
          interaction.reply(
            "Your member object was not found. Was this message used in a DM channel?"
          );

          return;
        }

        const member = await interaction.guild.members
          .fetch(apiMember.user.id)
          .catch(console.log);

        if (
          member &&
          !member.roles.cache.some(
            (r) =>
              command.roles
                ?.map((v) => client.clientOptions.roles[v])
                ?.includes(r.id) ?? false
          )
        ) {
          interaction.reply({
            ephemeral: true,
            content: "You are not a moderator and thus cannot run this command."
          });

          return;
        }
      }

      if (
        command.requiredChannel !== undefined &&
        interaction.channel?.id !==
          (await client.getChannel(command.requiredChannel))?.id
      ) {
        interaction.reply({
          ephemeral: true,
          content: "You are not using this command in the required channel!"
        });

        return;
      }

      console.log(`Running command "${command.name}"`);
      command.run(interaction, client);
    } else if (interaction.isButton()) {
      console.log(`Button clicked ${interaction.customId}`);
    }
  }
} as Event<"interactionCreate">;
