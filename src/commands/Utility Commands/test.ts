import { Command, RolesEnum } from "../../interfaces/Command";

export default {
  name: "test",
  description: "Tests the bot",
  category: "Utility",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction) => {
    interaction.reply("Test");
  }
} as Command;
