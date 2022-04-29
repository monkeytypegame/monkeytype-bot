/** @format */

import { connectDB } from "../functions/mongodb";
import { Event } from "../interfaces/Event";

export default {
  event: "ready",
  run: async (client) => {
    console.log(`${client.user.tag} is online!`);
    const guild = await client.guild;

    if (guild === undefined) {
      return;
    }

    const memberCount =
      guild.memberCount ??
      guild.approximateMemberCount ??
      guild.approximatePresenceCount;

    client.user.setActivity(`over ${memberCount} monkeys`, {
      type: "WATCHING"
    });

    client.logInBotLogChannel(":smile: Ready");

    connectDB().then(() => console.log("Database connected"));

    setInterval(async () => {
      client.user.setActivity(`over ${memberCount} monkeys`, {
        type: "WATCHING"
      });
    }, 3600000);

    setInterval(async () => {
      client.appendTasks();
    }, 30000);
  }
} as Event<"ready">;
