import type { MonkeyTypes } from "../../types/types";
import { createUser, getUser, setUser } from "../../functions/banana";

export default {
  name: "banana-donate",
  description: "Donate bananas to another user",
  category: "Banana",
  options: [
    {
      name: "user",
      description: "The user to donate to",
      type: "USER",
      required: true
    },
    {
      name: "amount",
      description: "The amount of bananas to donate",
      type: "INTEGER",
      required: true
    }
  ],
  run: async (interaction) => {
    const targetUser = interaction.options.getUser("user", true);

    const amount = interaction.options.getInteger("amount", true);

    const authorBananaEntry =
      getUser(interaction.user.id) ?? createUser(interaction.user.id);

    const targetBananaEntry = getUser(targetUser.id);

    if (targetBananaEntry === undefined) {
      interaction.reply(
        "❌ The user you are donating to does not have a banana profile."
      );

      return;
    }

    if (amount < 1) {
      interaction.reply("❌ You must donate at least 1 banana.");

      return;
    }

    if (authorBananaEntry.balance < amount) {
      interaction.reply("❌ You do not have enough bananas to donate.");

      return;
    }

    authorBananaEntry.balance -= amount;
    targetBananaEntry.balance += amount;

    setUser(interaction.user.id, authorBananaEntry);
    setUser(targetUser.id, targetBananaEntry);

    interaction.reply(
      `✅ Successfully donated ${amount} banana(s) to ${targetUser.tag}.`
    );
  }
} as MonkeyTypes.Command;
