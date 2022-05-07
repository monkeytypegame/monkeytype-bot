/** @format */

import type { MonkeyTypes } from "../../types/types";
import { mongoDB } from "../../functions/mongodb";

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
        content: "❌ Could not find user"
      });

      return;
    }

    const db = mongoDB();

    const dbUser = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({ discordId: user.id })
    );

    if (dbUser === undefined) {
      interaction.reply({
        content: "❌ Could not find user"
      });

      return;
    }

    const personalBests = dbUser?.personalBests;

    if (personalBests === undefined) {
      interaction.reply({
        content: "❌ User does not have personal bests"
      });

      return;
    }

    const timePBs = personalBests.time[60];

    if (timePBs === undefined || timePBs.length === 0) {
      interaction.reply({
        content: "❌ User does not have time 60 personal bests"
      });

      return;
    }

    const timePB = Math.round(Math.max(...timePBs.map(({ wpm }) => wpm), 0));

    const role = await client.getWPMRole(timePB);

    if (role === undefined) {
      interaction.reply({
        content: `❌ Could not find role for ${timePB} wpm`
      });

      return;
    }

    await client.removeAllWPMRoles(member);

    await member.roles.add(role.id);

    await member.roles.add(client.clientOptions.roles.memberRole);

    interaction.reply({
      content: `✅ Fixed wpm role: Assigned role ${role} to user ${member}`
    });

    return;
  }
} as MonkeyTypes.Command;
