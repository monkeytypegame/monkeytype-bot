/** @format */

import type { TaskFile } from "../interfaces/Task";

export default {
  name: "awardChallenge",
  run: async (client, guild, discordUserID: string, challengeName: string) => {
    if (discordUserID === undefined || challengeName === undefined) {
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

    const challengeRole =
      (await guild.roles.fetch(
        client.clientOptions.challenges[challengeName] ?? ""
      )) ?? undefined;

    if (challengeRole === undefined) {
      return {
        status: false,
        message: "Could not find challenge role"
      };
    }

    await member.roles.add(challengeRole);

    const botCommandsChannel = await client.getChannel("botCommands");

    if (botCommandsChannel !== undefined) {
      botCommandsChannel.send(
        `✅ Congratulations ${member} for passing the challenge. You have been awarded the ${challengeRole.name} role.`
      );
    }

    return {
      status: true,
      message: "Successfully awarded challenge"
    };
  }
} as TaskFile;
