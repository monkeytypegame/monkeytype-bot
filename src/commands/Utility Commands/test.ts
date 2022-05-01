/** @format */

import type { Command } from "../../interfaces/Command";

export default {
  name: "test",
  description: "Sends a test message",
  category: "Utility",
  needsPermissions: true,
  run: async (interaction) => {
    interaction.reply("Test");
  }
} as Command;
