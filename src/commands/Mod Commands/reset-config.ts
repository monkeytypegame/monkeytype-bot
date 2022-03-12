import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { DefaultConfig } from "../../constants/default-config";
import { User } from "../../types";

export default {
  name: "reset-config",
  description: "Resets a user's config",
  category: "Mod",
  options: [
    {
      name: "user",
      description: "The user to reset",
      type: "USER",
      required: true
    }
  ],
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const user = interaction.options.getUser("user", true);

    const db = mongoDB();

    const dbUser = <User>(
      await db.collection("users").findOne({ discordId: user.id })
    );

    if (dbUser === null) {
      interaction.followUp({
        ephemeral: true,
        content: ":x: Could not find user"
      });

      return;
    }

    await db
      .collection("configs")
      .updateOne(
        { uid: dbUser.uid },
        { $set: { config: DefaultConfig } },
        { upsert: true }
      );

    interaction.followUp({
      ephemeral: true,
      content: ":white_check_mark: Done!"
    });
  }
} as Command;
