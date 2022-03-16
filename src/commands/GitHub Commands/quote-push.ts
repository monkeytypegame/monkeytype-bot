import { Command, RolesEnum } from "../../interfaces/Command";

import SimpleGit from "simple-git";

const git = SimpleGit("../../../monkeytype");

export default {
  name: "quote-push",
  description: "Push quotes to github",
  category: "GitHub",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    try {
      await git.pull("upstream", "master");

      await git.add(["."]);

      await git.commit("Added quotes from Discord");

      await git.push("origin", "master");

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
