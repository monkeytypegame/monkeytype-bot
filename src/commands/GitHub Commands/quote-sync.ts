import { Command, RolesEnum } from "../../interfaces/Command";
import SimpleGit from "simple-git";

export default {
  name: "quote-sync",
  description: "Sync quotes from GitHub",
  category: "GitHub",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction, client) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const git = SimpleGit(client.clientOptions.repoPath);

    try {
      await git.fetch("upstream", "master");

      await git.checkout("master");

      await git.mergeFromTo("upstream", "master");

      await git.push("origin", "master");

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
