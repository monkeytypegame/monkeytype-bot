/** @format */

import { Command } from "../../interfaces/Command";
import SimpleGit from "simple-git";

export default {
  name: "quote-sync",
  description: "Sync quotes from GitHub",
  category: "GitHub",
  needsPermissions: true,
  run: async (interaction, client) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const git = SimpleGit(client.clientOptions.repoPath);

    try {
      await git.fetch("upstream", "dev");

      await git.checkout("dev");

      await git.mergeFromTo("upstream", "dev");

      await git.push("origin", "dev");

      interaction.followUp({
        ephemeral: true,
        content: ":white_check_mark: Successfully synced quotes from GitHub"
      });
    } catch (err) {
      console.log(err);

      interaction.followUp({
        ephemeral: true,
        content: `:x: Error trying to sync quotes from GitHub: \`\`\`${err}\`\`\``
      });
    }
  }
} as Command;
