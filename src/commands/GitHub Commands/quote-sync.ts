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

    await git.fetch("upstream", "dev");

    await git.checkout("dev");

    await git.mergeFromTo("upstream", "dev");

    await git.push("origin", "dev");

    interaction.followUp({
      ephemeral: true,
      content: "✅ Successfully synced quotes from GitHub"
    });
  }
} as Command;
