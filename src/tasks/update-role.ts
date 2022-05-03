import type { MonkeyTypes } from "../types/types";

export default {
  name: "updateRole",
  run: async (client, guild, discordUserID: string, wpm: number) => {
    if (discordUserID === undefined || wpm === undefined) {
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
        message: "Member not found"
      };
    }

    const roundedWPM = Math.round(wpm);

    const role = await client.getWPMRole(roundedWPM);

    const currentWPM = client.getUserWPMFromRole(member);

    if (role === undefined) {
      return {
        status: false,
        message: `Could not find role for ${roundedWPM} wpm`
      };
    }

    if (member.roles.cache.has(role.id)) {
      return {
        status: true,
        message: "User already has role"
      };
    } else if (
      !member.roles.cache.has(role.id) &&
      currentWPM !== undefined &&
      roundedWPM < currentWPM
    ) {
      return {
        status: true,
        message: "User already has a higher role"
      };
    }

    await client.removeAllWPMRoles(member);

    await member.roles.add(role);

    return {
      status: true,
      message: "Successfully updated role."
    };
  }
} as MonkeyTypes.TaskFile;
