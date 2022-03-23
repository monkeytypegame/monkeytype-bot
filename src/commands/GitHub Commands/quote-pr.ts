import { Command, RolesEnum } from "../../interfaces/Command";
import SimpleGit from "simple-git";
import fetch from "node-fetch";

export default {
  name: "quote-pr",
  description: "Post a pull request for the quotes to GitHub",
  category: "GitHub",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
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

      const response = await fetch(
        `https://api.github.com/repos/${client.clientOptions.repo}/pulls`,
        {
          method: "POST",
          redirect: "follow",
          headers: {
            Authorization: `token ${process.env["GITHUB_API_TOKEN"]}`,
            accept: "application/vnd.github.v3+json"
          },
          body: JSON.stringify({
            title: "Added more quotes",
            head: "monkeytypegeorge:dev",
            base: "dev",
            maintainer_can_modify: true
          })
        }
      );

      const json = await response.json();

      if (response.status === 201 && response.statusText === "Created") {
        interaction.followUp({
          ephemeral: true,
          content: `:white_check_mark: Successfully created pull request: \`\`\`${json.html_url}\`\`\``
        });
      } else {
        interaction.followUp({
          ephemeral: true,
          content: `:x: Error trying to create pull request: \`\`\`${json.message}\`\`\``
        });
      }
    } catch (err) {
      console.log(err);

      interaction.followUp({
        ephemeral: true,
        content: `:x: Error trying to create pull request: \`\`\`${err}\`\`\``
      });
    }
  }
} as Command;