/** @format */

import { Command } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { DefaultConfig } from "../../constants/default-config";
import { User } from "../../types";

export default {
  name: "reset-config",
  description: "Resets a user's config",
  category: "Dev",
  options: [
    {
      name: "user",
      description: "The user to reset",
      type: "USER",
      required: true
    }
  ],
  needsPermissions: true,
  run: async (interaction) => {
    await interaction.deferReply({
      ephemeral: true,
      fetchReply: false
    });

    const discordUser = interaction.options.getUser("user", true);

    const db = mongoDB();

    const user = <User | null>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (!user) {
      interaction.followUp({
        ephemeral: true,
        content: ":x: Could not find user"
      });

      return;
    }

    await db
      .collection("configs")
      .updateOne(
        { uid: user.uid },
        { $set: { config: DefaultConfig } },
        { upsert: true }
      )
      .catch((err) => {
        console.log(err);

        interaction.followUp({
          ephemeral: true,
          content: ":x: Could not update config. User has no config."
        });

        return;
      });

    interaction.followUp({
      ephemeral: true,
      content: ":white_check_mark: Done!"
    });
  }
} as Command;
