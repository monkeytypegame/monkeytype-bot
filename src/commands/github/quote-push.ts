import type { MonkeyTypes } from "../../types/types";

import SimpleGit from "simple-git";

export default {
  name: "quote-push",
  description: "Push quotes to GitHub",
  category: "GitHub",
  needsPermissions: true,
  run: async (interaction, client) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const git = SimpleGit(client.clientOptions.repoPath);

    await git.pull("upstream", "master");
    await git.add(["."]);
    await git.commit("Added quotes from Discord");
    await git.push("origin", "master");

    interaction.followUp({
      ephemeral: true,
      content: "✅ Successfully pushed quotes to GitHub"
    });
  }
} as MonkeyTypes.Command;
