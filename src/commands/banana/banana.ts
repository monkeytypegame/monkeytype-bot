import formatDistanceStrict from "date-fns/formatDistanceStrict";
import { Client } from "../../structures/client";
import type { MonkeyTypes } from "../../types/types";
import { createUser, getUser, setUser } from "../../utils/banana";
import { getNextDay, isSameDay } from "../../utils/date";
import { mongoDB } from "../../utils/mongodb";

export default {
  name: "banana",
  description: "Collect bananas",
  category: "Banana",
  run: async (interaction, client) => {
    await interaction.deferReply({ fetchReply: false });

    const db = mongoDB();

    const discordID = interaction.user.id;

    const bananaEntry = getUser(discordID) ?? createUser(discordID);

    const snapshot = <MonkeyTypes.User | undefined>(
      await db.collection("users").findOne({ discordId: discordID })
    );

    if (snapshot === undefined) {
      interaction.followUp({
        content: "❌ Could not find user. Make sure accounts are linked."
      });

      return;
    }

    const time60Bananas = (snapshot === null ? 0 : snapshot.bananas) ?? 0;

    const now = Date.now();

    const nowDate = new Date(now);

    const nextReset = getNextDay(now);

    const timeString = formatDistanceStrict(nowDate, nextReset);

    const lastCollectDate = new Date(bananaEntry.lastCollect);

    const embed = client.embed(
      {
        title: `${interaction.user.username}'s Bananas`,
        color: 0xe2b714,
        thumbnail: {
          url: Client.thumbnails.banana
        },
        description: `Banana collected! Come back in ${timeString} for more.`,
        fields: [
          {
            name: "Bananas",
            value: (bananaEntry.balance + time60Bananas).toString()
          }
        ]
      },
      interaction.user
    );

    if (isSameDay(lastCollectDate, nowDate)) {
      // same day, throw "error"

      embed.setDescription(
        `Too early! Come back in ${timeString} to collect your banana.`
      );
    } else {
      bananaEntry.balance++;
      bananaEntry.lastCollect = now;

      if (embed.fields[0] !== undefined) {
        embed.fields[0].value = (
          bananaEntry.balance + time60Bananas
        ).toString();
      }
    }

    if (time60Bananas > 0) {
      embed.addField("Bonus! 🥳", time60Bananas.toString());

      bananaEntry.balance += time60Bananas;

      db.collection("users").updateOne(
        { discordId: discordID },
        { $set: { bananas: 0 } }
      );
    }

    setUser(discordID, bananaEntry);

    interaction.followUp({ embeds: [embed] });
  }
} as MonkeyTypes.Command;
