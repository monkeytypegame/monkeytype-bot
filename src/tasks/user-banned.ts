import type { MonkeyTypes } from "../types/types";

export default {
  name: "userBanned",
  run: async (client, guild, discordUserID: string, banned: boolean) => {
    if (discordUserID === undefined || banned === undefined) {
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

    if (banned) {
      await client.removeAllWPMRoles(member);
      await member.roles.add(stinky);

      return {
        status: true,
        message:
          "Successfully removed all speed roles and assigned stinky role."
      };
    } else {
      await member.roles.remove(stinky);
      return {
        status: true,
        message: "Successfully removed stinky role."
      };
    }
  }
} as MonkeyTypes.TaskFile;
