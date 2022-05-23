/** @format */

import type { MonkeyTypes } from "../../types/types";
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

    await git.fetch("upstream", "master");
    await git.checkout("master");
    await git.mergeFromTo("upstream/master", "master");
    await git.push("origin", "master");

    interaction.followUp({
      ephemeral: true,
      content: "✅ Successfully synced quotes from GitHub"
    });
  }
} as MonkeyTypes.Command;
