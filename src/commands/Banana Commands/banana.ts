/** @format */

import { Command } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { createUser, getUser, setUser } from "../../functions/banana";
import { User } from "../../types";
import { getNextDay, isSameDay } from "../../functions/date";
import moment from "moment";

export default {
  name: "banana",
  description: "Collect bananas",
  category: "Banana",
  run: async (interaction, client) => {
    await interaction.deferReply({ fetchReply: false });

    const db = mongoDB();

    const discordID = interaction.user.id;

    const bananaEntry = getUser(discordID) ?? createUser(discordID);

    const snapshot = <User | null>(
      await db.collection("users").findOne({ discordId: discordID })
    );

    if (snapshot === null) {
      interaction.followUp({
        content: "❌ Could not find user. Make sure accounts are paired."
      });
    }

    const time60Bananas = (snapshot === null ? 0 : snapshot.bananas) ?? 0;

    const now = Date.now();

    const nowDate = new Date(now);

    const nextReset = getNextDay(now);

    const dateDiff = nextReset.getTime() - now;

    const momentDuration = moment.duration(dateDiff);

    let timeString = "";

    if (momentDuration.hours()) {
      timeString = `${momentDuration.hours()} hour(s)`;
    } else if (momentDuration.minutes()) {
      timeString = `${momentDuration.minutes()} minute(s)`;
    } else if (momentDuration.seconds()) {
      timeString = `${momentDuration.seconds()} second(s)`;
    } else {
      timeString = "less than a second";
    }

    const lastCollectDate = new Date(bananaEntry.lastCollect);

    const embed = client.embed(
      {
        title: `${interaction.user.username}'s Bananas`,
        color: 0xe2b714,
        thumbnail: {
          url: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
        },
        description: `Banana collected! Come back in ${timeString} for more.`,
        fields: [
          {
            name: "Bananas",
            value: (bananaEntry.balance + time60Bananas).toString(),
            inline: false
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
} as Command;
