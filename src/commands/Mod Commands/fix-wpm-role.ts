import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { User } from "../../types";
import { GuildMember } from "discord.js";

export default {
  name: "fix-wpm-role",
  description: "Fixes the WPM role on the supplied user",
  category: "Mod",
  options: [
    {
      name: "user",
      description: "The user to fix",
      type: "USER",
      required: true
    }
  ],
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction, client) => {
    const user = interaction.options.getUser("user", true);

    const member = <GuildMember>await interaction.guild?.members.fetch(user);

    const db = mongoDB();

    const dbUser = <User | null>(
      await db.collection("users").findOne({ discordId: user.id })
    );

    if (dbUser === null) {
      interaction.reply({
        ephemeral: false,
        content: ":x: Could not find user"
      });

      return;
    }

    const pbs = dbUser.personalBests;

    if (pbs === undefined) {
      interaction.reply({
        ephemeral: false,
        content: ":x: User does not have personal bests"
      });

      return;
    }

    const timePBs = pbs.time[60];

    if (timePBs === undefined || timePBs.length === 0) {
      interaction.reply({
        ephemeral: false,
        content: ":x: User does not have time 60 personal bests"
      });

      return;
    }

    const timePB = Math.round(Math.max(...timePBs.map(({ wpm }) => wpm), 0));

    const role = client.clientOptions.wpmRoles.find(
      (r) => timePB >= r.min && timePB <= r.max
    );

    if (role === undefined) {
      interaction.reply({
        ephemeral: false,
        content: `:x: Could not find role for wpm ${timePB}`
      });

      return;
    }

    member.roles.add(role.id).then(() => {
      interaction.reply({
        ephemeral: false,
        content: `:white_check_mark: Fixed wpm role: Assigned role ${role.id} to user ${member}`
      });
    });
  }
} as Command;
