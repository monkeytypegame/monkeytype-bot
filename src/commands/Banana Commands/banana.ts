import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { createUser, getUser, setUser } from "../../functions/banana";
import { User } from "../../types";
import { getNextDay, isSameDay } from "../../functions/date";
import moment from "moment";

export default {
  name: "banana",
  description: "Collect bananas",
  category: "Banana",
  roles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  requiredChannel: "banana",
  run: async (interaction, client) => {
    await interaction.deferReply({ ephemeral: false, fetchReply: false });

    const db = mongoDB();

    const discordID = interaction.user.id;

    try {
      const bananaEntry = getUser(discordID) ?? createUser(discordID);

      const snapshot = <User | null>(
        await db.collection("users").findOne({ discordId: discordID })
      );

      if (snapshot === null) {
        interaction.followUp({
          ephemeral: false,
          content: ":x: Could not find user. Make sure accounts are paired."
        });
      }

      const time60Bananas = snapshot === null ? 0 : snapshot.bananas;

      const now = Date.now();

      const nowDate = new Date(now);

      const nextReset = getNextDay(now);

      const dateDiff = Math.floor((nextReset.getTime() - now) / 1000);

      const timeString = moment(dateDiff).format(
        "H [hours], m [minutes], s [seconds]"
      );

      const lastCollectDate = new Date(bananaEntry.lastCollect);

      const embed = client.embed({
        title: `${interaction.user.username}'s Bananas`,
        color: 0xe2b714,
        thumbnail: {
          url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
        },
        description: `Banana collected! Come back in ${timeString} for more.`,
        fields: [
          {
            name: "Bananas",
            value: (
              (bananaEntry.balance ?? 0) + (time60Bananas ?? 0)
            ).toString(),
            inline: false
          }
        ]
      });

      if (isSameDay(lastCollectDate, nowDate)) {
        // same day, throw "error"

        embed.setDescription(
          `Too early! Come back in ${timeString} to collect your banana.`
        );
      } else {
        bananaEntry.balance++;
        bananaEntry.lastCollect = now;
      }

      if (time60Bananas !== undefined && time60Bananas > 0) {
        embed.addField("Bonus! :partying_face:", time60Bananas.toString());

        bananaEntry.balance += time60Bananas;

        db.collection("users").updateOne(
          { discordId: discordID },
          { $set: { bananas: 0 } }
        );
      }

      setUser(discordID, bananaEntry);

      interaction.followUp({ embeds: [embed] });
    } catch (err) {
      interaction.followUp({
        ephemeral: false,
        content: `Something went wrong getting your banana balance: ${err}`
      });
    }
  }
} as Command;
