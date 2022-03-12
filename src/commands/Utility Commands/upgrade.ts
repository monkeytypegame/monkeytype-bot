import { Command, RolesEnum } from "../../interfaces/Command";
import { spawn } from "child_process";

export default {
  name: "upgrade",
  description: "Upgrade the bot",
  category: "Utility",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction) => {
    try {
      const subprocess = spawn("/home/ubuntu/monkey-bot/upgrade.sh", [], {
        detached: true,
        stdio: "ignore"
      });

      subprocess.unref();

      interaction.reply(":thinking: Upgrading...");
    } catch (e) {
      console.log(e);

      interaction.reply(`:x: Could not upgrade\n\`\`\`${e}\`\`\``);
    }
  }
} as Command;
