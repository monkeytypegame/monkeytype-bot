import { Command, RolesEnum } from "../../interfaces/Command";

export default {
  name: "refresh",
  description: "Sends a refresh message",
  category: "Utility",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction) => {
    interaction.reply(
      `Make sure you clear your cache! This is should be the first thing you try if something doesn't seem right or after Miodec fixed a bug. All it does it makes sure you get the latest code from the server.\n\nYou can do so by pressing \`CTRL/CMD + SHIFT + R\`.

      `
    );
  }
} as Command;
