import { User } from "discord.js";
import { randomBoolean } from "../functions/random";
import { Event } from "../interfaces/Event";

const re = /\[#([0-9]{1,4})\]/g;

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || message.channel.type === "DM" || !message.member)
      return;

    if (
      client.clientOptions.dev === true &&
      message.author.id !== client.clientOptions.devID
    )
      return;

    const githubIssueLink = `https://github.com/${client.clientOptions.repo}/issues/`;

    const githubLinkMatches = [...message.content.matchAll(re)];

    const githubLinks = githubLinkMatches.map((v) => githubIssueLink + v[1]);

    if (githubLinks.length !== 0) {
      message.reply({ content: githubLinks.join("\n") });
      return;
    }

    if (
      message.content === "ping" &&
      message.member?.roles.cache.some((r) =>
        [
          client.clientOptions.roles.modRole,
          client.clientOptions.roles.adminRole
        ].includes(r.id)
      )
    )
      return message.reply("pong");

    if (message.mentions.has(client.user as User)) {
      if (/(shut *up|stfu|sh+|bad)/g.test(message.content.toLowerCase())) {
        if (randomBoolean()) message.channel.send(":(");
        else message.channel.send("<:hmph:736029217380237363>");
      } else if (
        /(good|nice|thanks|good job|thank you|ty|great)/g.test(
          message.content.toLowerCase()
        )
      )
        message.channel.send(":)");

      return;
    }

    if (
      /(how.*role.*\?)|(how.*challenge.*\?)|(wpm role.*\?)|(pair.*account.*\?)/g.test(
        message.content.toLowerCase()
      )
    )
      message.channel.send(
        `:question: Hey ${message.author}, checkout the <#741305227637948509> channel.`
      );

    return;
  }
} as Event<"messageCreate">;
