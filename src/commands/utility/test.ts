/** @format */

import type { MonkeyTypes } from "../../types/types";

export default {
  name: "test",
  description: "Sends a test message",
  category: "Utility",
  needsPermissions: true,
  run: async (interaction) => {
    interaction.reply("Test");
  }
} as MonkeyTypes.Command;
