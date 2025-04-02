import type { MonkeyTypes } from "../types/types";
import { mongoDB } from "../utils/mongodb";

export default {
  name: "linkDiscord",
  run: async (
    client,
    guild,
    discordUserID: string,
    userID: string,
    optedOutOfLbs: boolean
  ) => {
    if (discordUserID === undefined || userID === undefined) {
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
        message: "Could not find user",
        member: discordUserID
      };
    }

    const memberRole = guild.roles.cache.get(
      client.clientOptions.roles.memberRole
    );

    if (memberRole === undefined) {
      return {
        status: false,
        message: "Could not find member role",
        member
      };
    }

    await member.roles.add(memberRole);

    const db = mongoDB();

    const dbUser = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({
        discordId: discordUserID
      })
    );

    const botCommandsChannel = await client.getChannel("botCommands");

    let message = `✅ ${member}, your account is linked.`;

    if (optedOutOfLbs) {
      message += ` You have opted out of leaderboards, so you will not receive a WPM role.`;
    } else if (
      dbUser !== undefined &&
      dbUser.personalBests !== undefined &&
      dbUser.personalBests.time[60] !== undefined &&
      dbUser.personalBests.time[60].length > 0
    ) {
      const timePB = Math.round(
        Math.max(...dbUser.personalBests.time[60].map(({ wpm }) => wpm), 0)
      );

      const wpmRole = await client.getWPMRole(timePB);

      if (wpmRole !== undefined) {
        await member.roles.add(wpmRole);

        message += ` You have received the ${wpmRole} role.`;
      }
    } else if (dbUser !== undefined && dbUser.personalBests !== undefined) {
      message += ` I was unable to give you a WPM role because you have not completed any 60 second tests`;
    } else {
      message += ` I was unable to give you a WPM role at this time.`;
    }

    if (botCommandsChannel !== undefined) {
      await botCommandsChannel.send(message);
    }

    return {
      status: true,
      message: "Successfully linked discord user",
      member
    };
  }
} as MonkeyTypes.TaskFile;
