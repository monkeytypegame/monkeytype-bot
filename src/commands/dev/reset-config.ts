import { DefaultConfig } from "../../constants/default-config";
import type { MonkeyTypes } from "../../types/types";
import { mongoDB } from "../../utils/mongodb";

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

    const user = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({ discordId: discordUser.id })
    );

    if (!user) {
      interaction.followUp({
        ephemeral: true,
        content: "❌ Could not find user"
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
          content: "❌ Could not update config. User has no config."
        });
      });

    interaction.followUp({
      ephemeral: true,
      content: "✅ Done!"
    });
  }
} as MonkeyTypes.Command;
