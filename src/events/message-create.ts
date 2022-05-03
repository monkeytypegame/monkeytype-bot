/** @format */

import { User } from "discord.js";
import { randomBoolean } from "../functions/random";
import type { MonkeyTypes } from "../types/types";

const githubLinkRegex = /\[#([0-9]{1,4})\]/g;

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

    const githubLinkMatches = [...message.content.matchAll(githubLinkRegex)];

    const githubLinks = githubLinkMatches.map(
      ([, issueNum]) =>
        `https://github.com/${client.clientOptions.repo}/issues/${issueNum}`
    );

    if (githubLinks.length !== 0) {
      message.reply({ content: githubLinks.join("\n") });
      return;
    }

    if (
      message.content === "ping" &&
      message.member?.permissions.has("MANAGE_GUILD")
    ) {
      return message.reply("pong");
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
    }

    return;
  }
} as MonkeyTypes.Event<"messageCreate">;
