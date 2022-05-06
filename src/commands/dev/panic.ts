import { MonkeyTypes } from "../../types/types";

export default {
  name: "panic",
  description: "Kill the bot",
  category: "Dev",
  run: async (interaction) => {
    interaction.reply("💀 Killing the bot. 💀");

    console.log(`Bot killed by ${interaction.user.tag}`);

    process.exit(1);
  }
} as MonkeyTypes.Command;
