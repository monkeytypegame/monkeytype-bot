/** @format */

import { Command } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { User } from "../../types";

export default {
  name: "fix-wpm-role",
  description: "Fixes the WPM role on the supplied user",
  category: "Dev",
  options: [
    {
      name: "user",
      description: "The user to fix",
      type: "USER",
      required: true
    }
  ],
  needsPermissions: true,
  run: async (interaction, client) => {
    const user = interaction.options.getUser("user", true);

    const member = await interaction.guild?.members.fetch(user);

    if (member === undefined) {
      interaction.reply({
        content: ":x: Could not find user"
      });

      return;
    }

    const db = mongoDB();

    const dbUser = <User | null>(
      await db.collection("users").findOne({ discordId: user.id })
    );

    if (dbUser === null) {
      interaction.reply({
        content: ":x: Could not find user"
      });

      return;
    }

    const pbs = dbUser.personalBests;

    if (pbs === undefined) {
      interaction.reply({
        content: ":x: User does not have personal bests"
      });

      return;
    }

    const timePBs = pbs.time[60];

    if (timePBs === undefined || timePBs.length === 0) {
      interaction.reply({
        content: ":x: User does not have time 60 personal bests"
      });

      return;
    }

    const timePB = Math.round(Math.max(...timePBs.map(({ wpm }) => wpm), 0));

    const role = await client.getWPMRole(timePB);

    if (role === undefined) {
      interaction.reply({
        content: `:x: Could not find role for ${timePB} wpm`
      });

      return;
    }

    await client.removeAllWPMRoles(member);

    await member.roles.add(role.id);

    interaction.reply({
      content: `:white_check_mark: Fixed wpm role: Assigned role ${role.name} (${role.id}) to user ${member}`
    });

    return;
  }
} as Command;
