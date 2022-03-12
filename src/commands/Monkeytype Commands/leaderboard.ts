import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";

export default {
  name: "leaderboard",
  description: "Shows a paginated leaderboard that shows your rank",
  category: "Monkeytype",
  options: [
    {
      name: "language",
      description: "The langauge to query",
      type: "STRING",
      required: true
    },
    {
      name: "mode",
      description: "The mode to query",
      type: "STRING",
      required: true,
      choices: [
        {
          name: "time",
          value: "time"
        },
        {
          name: "words",
          value: "words"
        },
        {
          name: "quote",
          value: "quote"
        }
      ]
    }
  ],
  roles: [RolesEnum.MEMBER],
  run: async (interaction, client) => {
    const db = mongoDB();

    const language = interaction.options.getString("language", true);
    const mode = interaction.options.getString("mode", true);
    const mode2 = interaction.options.getString("mode2", true);

    const leaderboardData = db
      .collection(`leaderboards.${language}.${mode}.${mode2}`)
      .find();
  }
} as Command;
