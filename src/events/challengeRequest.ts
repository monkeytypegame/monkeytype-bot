/** @format */

import { Message, User } from "discord.js";
import { Event } from "../interfaces/Event";

type FailReasons = "badFormat" | "challengeDoesntExist" | "noProof";

function fail(message: Message<boolean>, reason: FailReasons): void {
  let string = ":x: Something went wrong";
  if (reason === "badFormat") {
    string = ":x: Please use the correct format to submit a challenge";
  } else if (reason === "challengeDoesntExist") {
    string = ":x: Challenge role not found";
  } else if (reason === "noProof") {
    string = ":x: Please provide proof that you've completed the challenge";
  }
  message.channel.send(string);
}

export default {
  event: "messageCreate",
  run: async (client, message) => {
    if (
      !message ||
      message.author.bot ||
      message.channel.type === "DM" ||
      !message.member ||
      message.channelId !==
        client.clientOptions.channels.challengeSubmissions ||
      !message.mentions.has(client.user as User)
    ) {
      return;
    }

    //user pinged the bot in the challenge submission channel

    const messageSplit = message.content.split("\n").map((s) => s.trim());

    const proof: string[] = [];

    if (!messageSplit || messageSplit.length < 3) {
      return fail(message, "badFormat");
    } else if (messageSplit.length === 2) {
      //get the image
      proof.push(...message.attachments.map((a) => a.url));
    } else if (messageSplit.length >= 3) {
      //remove first 2 elements from array, return rest
      proof.push(...messageSplit.slice(2));
    }

    if (!proof || proof.length === 0) {
      return fail(message, "noProof");
    }

    const challengeRoleId =
      Object.values(client.clientOptions.challenges).find(
        (cid) => cid === message.mentions.roles.first()?.id
      ) ?? "";

    if (challengeRoleId === "") {
      return fail(message, "challengeDoesntExist");
    }

    message.react("✅");
  }
} as Event<"messageCreate">;
