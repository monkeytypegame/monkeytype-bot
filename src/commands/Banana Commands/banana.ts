import { Command, RolesEnum } from "../../interfaces/Command";
import { mongoDB } from "../../functions/mongodb";
import { createUser, getUser, setUser } from "../../functions/banana";
import { User } from "../../types";
import moment from "moment";

export default {
  name: "banana",
  description: "Collect bananas",
  category: "Banana",
  requiredRoles: [RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  run: async (interaction, client) => {
    await interaction.deferReply({ ephemeral: false, fetchReply: false });

    const db = mongoDB();

    const discordID = interaction.user.id;

    try {
      let bananaEntry = getUser(discordID);

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

      if (bananaEntry === undefined) {
        bananaEntry = createUser(discordID);

        const nextReset = addDays(now, 1);
        nextReset.setHours(0);
        nextReset.setMinutes(0);
        nextReset.setSeconds(0);
        nextReset.setMilliseconds(0);

        const dateDiff = Math.floor((nextReset.getTime() - now) / 1000);

        const timeString = moment(dateDiff).format(
          "H [hours], m [minutes], s [seconds]"
        );

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
              value: "1",
              inline: false
            }
          ]
        });

        if (time60Bananas !== undefined && time60Bananas !== 0) {
          bananaEntry.balance += time60Bananas;

          db.collection("users").updateOne(
            { discordId: discordID },
            { $set: { bananas: 0 } }
          );
        }

        interaction.followUp({ embeds: [embed] });
      } else {
        const lastCollectDate = new Date(bananaEntry.lastCollect);

        const nowDate = new Date(now);

        if (
          lastCollectDate.getUTCFullYear() === nowDate.getUTCFullYear() &&
          lastCollectDate.getUTCMonth() === nowDate.getUTCMonth() &&
          lastCollectDate.getUTCDate() === nowDate.getUTCDate()
        ) {
          // same day, throw error

          const nextReset = addDays(now, 1);
          nextReset.setHours(0);
          nextReset.setMinutes(0);
          nextReset.setSeconds(0);
          nextReset.setMilliseconds(0);

          const dateDiff = Math.floor((nextReset.getTime() - now) / 1000);

          const timeString = moment(dateDiff).format(
            "H [hours], m [minutes], s [seconds]"
          );

          const embed = client.embed({
            title: `${interaction.user.username}'s Bananas`,
            color: 0xe2b714,
            thumbnail: {
              url:
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/banana_1f34c.png"
            },
            description: `Too early! Come back in ${timeString} to collect your banana.`,
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

          if (time60Bananas !== undefined && time60Bananas > 0) {
            embed.addField("Bonus! :partying_face:", time60Bananas.toString());
          }

          if (time60Bananas !== undefined && time60Bananas !== 0) {
            bananaEntry.balance += time60Bananas;

            db.collection("users").updateOne(
              { discordId: discordID },
              { $set: { bananas: 0 } }
            );
          }

          interaction.followUp({ embeds: [embed] });
        } else {
          bananaEntry.balance++;
          bananaEntry.lastCollect = now;

          const nextReset = addDays(now, 1);
          nextReset.setHours(0);
          nextReset.setMinutes(0);
          nextReset.setSeconds(0);
          nextReset.setMilliseconds(0);

          const dateDiff = Math.floor((nextReset.getTime() - now) / 1000);

          const timeString = moment(dateDiff).format(
            "H [hours], m [minutes], s [seconds]"
          );

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

          if (time60Bananas !== undefined && time60Bananas !== 0) {
            embed.addField("Bonus! :partying_face:", time60Bananas.toString());
          }

          if (time60Bananas !== undefined && time60Bananas > 0) {
            bananaEntry.balance += time60Bananas;

            db.collection("users").updateOne(
              { discordId: discordID },
              { $set: { bananas: 0 } }
            );
          }

          interaction.followUp({ embeds: [embed] });
        }
      }

      setUser(discordID, bananaEntry);
    } catch (err) {
      interaction.followUp({
        ephemeral: false,
        content: `Something went wrong getting your banana balance: ${err}`
      });
    }
  }
} as Command;

function addDays(date: number, days: number): Date {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
