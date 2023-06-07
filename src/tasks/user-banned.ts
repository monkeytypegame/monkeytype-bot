import type { MonkeyTypes } from "../types/types";

export default {
  name: "userBanned",
  run: async (client, guild, discordUserID: string) => {
    if (discordUserID === undefined) {
      return {
        status: false,
        message: "Invalid parameters",
        member: discordUserID
      };
    }

    const member = await guild.members
      .fetch(discordUserID)
      .catch(() => undefined);

    if (member === undefined) {
      return {
        status: false,
        message: "Member not found",
        member: discordUserID
      };
    }

    const stinky = await client.getStinkyRole();
    if (stinky === undefined) {
      return {
        status: false,
        message: `Could not find stinky role`,
        member
      };
    }

    await client.removeAllWPMRoles(member);

    await member.roles.add(stinky);

    return {
      status: true,
      message: "Successfully removed all speed roles and assigned stinky role."
    };
  }
} as MonkeyTypes.TaskFile;
