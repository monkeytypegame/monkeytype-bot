import { Event } from "../interfaces/Event";

export default {
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isCommand()) {
      const commandName = interaction.commandName;

      const command = client.commands.get(commandName);

      if (command === undefined)
        return interaction.reply("Could not find this command on the bot.");

      if (command.roles !== undefined && command.roles.length !== 0) {
        const apiMember = interaction.member;

        if (apiMember === null || !interaction.guild)
          return interaction.reply(
            "Your member object was not found. Was this message used in a DM channel?"
          );

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
        )
          return interaction.reply({
            ephemeral: true,
            content: "You are not a moderator and thus cannot run this command."
          });
      }

      console.log(`Running command "${command.name}"`);
      command.run(interaction, client);
    } else if (interaction.isButton()) {
      console.log(`Button clicked ${interaction.customId}`);
    }
  }
} as Event<"interactionCreate">;
