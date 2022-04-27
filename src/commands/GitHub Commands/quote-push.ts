/** @format */

import { Command } from "../../interfaces/Command";

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

    try {
      await git.pull("upstream", "dev");

      await git.add(["."]);

      await git.commit("Added quotes from Discord");

      await git.push("origin", "dev");

      interaction.followUp({
        ephemeral: true,
        content: ":white_check_mark: Successfully pushed quotes to GitHub"
      });
    } catch (err) {
      console.log(err);

      interaction.followUp({
        ephemeral: true,
        content: `:x: Error trying to push quotes to GitHub: \`\`\`${err}\`\`\``
      });
    }
  }
} as Command;
