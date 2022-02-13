import { Event } from "../interfaces/Event";

export default {
  event: "messageDelete",
  run: async (client, message) => {
    if (message.guild === null) return;

    // const fetchedLogs = await message.guild.fetchAuditLogs({
    //   limit: 1,
    //   type: "MESSAGE_DELETE"
    // });

    // const deletionLog = fetchedLogs.entries.first();

    client.logInBotLogChannel(
      `:wastebasket: ${message.author}'s message in <#${message.channel.id}> was deleted:\n${message.content}`
    );
  }
} as Event<"messageDelete">;
