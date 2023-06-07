import type { MonkeyTypes } from "../types/types";

export default {
  name: "removeSpeedRoles",
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

    await client.removeAllWPMRoles(member);

    return {
      status: true,
      message: "Successfully removed all speed roles."
    };
  }
} as MonkeyTypes.TaskFile;
