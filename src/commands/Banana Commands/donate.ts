import { Command, RolesEnum } from "../../interfaces/Command";
import { getUser, setUser } from "../../functions/banana";

export default {
  name: "donate",
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
  roles: [RolesEnum.MEMBER],
  run: async (interaction) => {
    const targetUser = interaction.options.getUser("user", true);

    const amount = interaction.options.getInteger("amount", true);

    const authorBananaEntry = getUser(interaction.user.id);

    const targetBananaEntry = getUser(targetUser.id);

    if (authorBananaEntry === undefined) {
      interaction.reply(":x: You do not have an existing banana profile.");
      return;
    }

    if (targetBananaEntry === undefined) {
      interaction.reply(
        ":x: The user you are donating to does not have a banana profile."
      );
      return;
    }

    if (authorBananaEntry.balance < amount) {
      interaction.reply(":x: You do not have enough bananas to donate.");
      return;
    }

    authorBananaEntry.balance -= amount;
    targetBananaEntry.balance += amount;

    setUser(interaction.user.id, authorBananaEntry);
    setUser(targetUser.id, targetBananaEntry);

    interaction.reply(
      `:white_check_mark: Successfully donated ${amount} banana(s) to ${targetUser.tag}.`
    );
  }
} as Command;
