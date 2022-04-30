/** @format */

import { Message, User } from "discord.js";
import { Event } from "../interfaces/Event";
import clientOptions from "../config/config.json";

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
      message.channelId !== clientOptions.channels.challengeSubmission ||
      !message.mentions.has(client.user as User)
    ) {
      return;
    }

    //user pinged the bot in the challenge submission channel

    const messageSplit = message.content.split("\n").map((s) => s.trim());

    let proof = "";

    if (!messageSplit || messageSplit.length === 1) {
      return fail(message, "badFormat");
    } else if (messageSplit.length === 2) {
      //get the image
      proof = message.attachments.first()?.url ?? "";
    } else if (messageSplit.length === 3) {
      proof = messageSplit[2] ?? "";
    }

    if (!proof || proof.length === 0) {
      return fail(message, "noProof");
    }

    const challengeRoleId =
      Object.values(clientOptions.challenges).find(
        (cid) => cid === message.mentions.roles.first()?.id
      ) ?? "";

    const challengeRole = message.guild?.roles.cache.get(challengeRoleId);

    if (!challengeRole) {
      return fail(message, "challengeDoesntExist");
    }

    message.react("✅");
  }
} as Event<"messageCreate">;
