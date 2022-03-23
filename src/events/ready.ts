import { runTasks } from "../tasks/runTasks";
import { connectDB } from "../functions/mongodb";
import { Event } from "../interfaces/Event";

export default {
  event: "ready",
  run: async (client) => {
    console.log(`${client.user?.tag} is online!`);
    const guild = await client.guild;

    if (guild === undefined) return;

    client.user?.setActivity(`over ${guild.approximatePresenceCount} monkeys`, {
      type: "WATCHING"
    });

    client.logInBotLogChannel(":smile: Ready");

    connectDB().then(() => console.log("Database connected"));

    setInterval(async () => {
      client.user?.setActivity(
        `over ${guild.approximatePresenceCount ?? guild.memberCount} monkeys`,
        {
          type: "WATCHING"
        }
      );
    }, 3600000);

    setInterval(async () => {
      runTasks(client);
    }, 30000);
  }
} as Event<"ready">;