import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { User } from "../../types";

export default {
  name: "pb",
  description: "Shows your personal bests",
  category: "Stats",
  roles: [RolesEnum.MEMBER],
  run: async (interaction, client) => {
    const db = mongoDB();

    const user = <User | null>(
      await db.collection("users").findOne({ discordId: interaction.user.id })
    );

    if (user === null) {
      return interaction.reply({
        ephemeral: true,
        content: ":x: Could not find user. Make sure your accounts are paired."
      });
    }

    const pb = user.personalBests;
  }
} as Command;
