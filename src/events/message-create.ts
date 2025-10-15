import { User } from "discord.js";
import type { MonkeyTypes } from "../types/types";
import { randomBoolean } from "../utils/random";

const issueOrPRRegex = /\[#([0-9]{1,4})\]/g;
const commit = /\[([0-9a-fA-F]{7}|[0-9a-fA-F]{40})\]/g;

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (
      message.author.bot ||
      message.channel.type === "DM" ||
      !message.member
    ) {
      return;
    }

    if (
      client.clientOptions.dev === true &&
      message.author.id !== client.clientOptions.devID
    ) {
      return;
    }

    const issueOrPRMatches = [...message.content.matchAll(issueOrPRRegex)];
    const commitMatches = [...message.content.matchAll(commit)];

    const githubLinks = [
      ...issueOrPRMatches.map(
        ([, num]) =>
          `https://github.com/${client.clientOptions.repo}/issues/${num}`
      ),
      ...commitMatches.map(
        ([, hash]) =>
          `https://github.com/${client.clientOptions.repo}/commit/${hash}`
      )
    ];

    if (
      githubLinks.length !== 0 &&
      (await client.getChannel("development"))?.id === message.channel.id
    ) {
      message.reply({ content: githubLinks.join("\n") });

      return;
    }

    if (
      message.content === "ping" &&
      message.member?.permissions.has("MANAGE_GUILD")
    ) {
      message.reply("pong");

      return;
    }

    if (message.mentions.has(client.user as User)) {
      if (/(shut *up|stfu|sh+|bad)/g.test(message.content.toLowerCase())) {
        if (randomBoolean()) {
          message.channel.send(":(");
        } else {
          message.channel.send(
            message.guild?.emojis.cache
              .find((e) => e.name === "hmph")
              ?.toString() ?? "<:hmph:736029217380237363>"
          );
        }
      } else if (
        /(good|nice|thanks|good job|thank you|ty|great)/g.test(
          message.content.toLowerCase()
        )
      ) {
        message.channel.send(":)");
      } else if (/(cute)/g.test(message.content.toLowerCase())) {
        message.channel.send("😳");
      }

      return;
    }

    if (
      /(how.*role.*\?)|(how.*challenge.*\?)|(wpm role.*\?)|(pair.*account.*\?)/g.test(
        message.content.toLowerCase()
      )
    ) {
      const channel = message.guild?.channels.cache.get("741305227637948509");

      message.channel.send(
        `❓ Hey ${message.author}, checkout the ${channel} channel.`
      );
    } else if (
      /how.*improve.*(15s|60s|acc|wpm).*\?/g.test(
        message.content.toLowerCase()
      )
    ) {
      const channel = message.guild?.channels.cache.get("751071581664706640");
      
      message.channel.send(
        `❓ Hey ${message.author}, checkout the ${channel} channel.`
      )
    }

    return;
  }
} as MonkeyTypes.Event<"messageCreate">;
