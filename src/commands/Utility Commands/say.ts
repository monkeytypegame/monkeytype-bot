import { NewsChannel, TextChannel } from "discord.js";
import { Command, RolesEnum } from "../../interfaces/Command";

export default {
  name: "say",
  description: "Say something in another channel",
  category: "Utility",
  options: [
    {
      name: "channel",
      description: "The channel to say the message in",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
      required: true
    },
    {
      name: "message",
      description: "The message to send",
      type: "STRING",
      required: true
    }
  ],
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction) => {
    const channel = interaction.options.getChannel("channel", true) as
      | TextChannel
      | NewsChannel;

    const message = interaction.options.getString("message", true);

    channel.send({ content: message });

    interaction.reply({ ephemeral: true, content: ":speech_balloon: Done." });
  }
} as Command;