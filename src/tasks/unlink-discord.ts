import type { MonkeyTypes } from "../types/types";

export default {
  name: "unlinkDiscord",
  run: async (client, guild, discordUserID: string, userID: string) => {
    if (discordUserID === undefined || userID === undefined) {
      return {
        status: false,
        message: "Invalid parameters"
      };
    }

    const member = await guild.members
      .fetch(discordUserID)
      .catch(() => undefined);

    if (member === undefined) {
      return {
        status: false,
        message: "Could not find user"
      };
    }

    const memberRole = guild.roles.cache.get(
      client.clientOptions.roles.memberRole
    );

    if (memberRole === undefined) {
      return {
        status: false,
        message: "Could not find member role"
      };
    }

    await member.roles.remove(memberRole);

    await client.removeAllWPMRoles(member);

    const botCommandsChannel = await client.getChannel("botCommands");

    if (botCommandsChannel !== undefined) {
      botCommandsChannel.send(`✅ ${member}, your account is unlinked.`);
    }

    return {
      status: true,
      message: "Successfully unlinked discord user"
    };
  }
} as MonkeyTypes.TaskFile;
