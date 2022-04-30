/** @format */

import { Message } from "discord.js";
import { Event } from "../interfaces/Event";

type FailReasons = "badFormat" | "invalidChallenge" | "noProof";

function fail(message: Message<boolean>, reason: FailReasons): void {
  let string = ":x: Something went wrong";
  if (reason === "badFormat") {
    string = ":x: Please use the correct format to submit a challenge";
  } else if (reason === "invalidChallenge") {
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
      !message.guild ||
      !message.member ||
      message.channelId !==
        (await client.getChannel("challengeSubmissions"))?.id ||
      !message.mentions.has(client.user)
    ) {
      return;
    }

    //user pinged the bot in the challenge submission channel

    const messageSplit = message.content.split("\n").map((s) => s.trim());

    const proof: string[] = [];

    if (!messageSplit || messageSplit.length < 2) {
      return fail(message, "badFormat");
    }
    if (message.attachments.size > 0) {
      //get all attachments
      proof.push(...message.attachments.map((a) => a.url));
    }
    if (messageSplit.length >= 3) {
      //remove first 2 elements from array, return rest
      proof.push(...messageSplit.slice(2));
    }

    if (!proof || proof.length === 0) {
      return fail(message, "noProof");
    }

    const challengeRoleId = Object.values(client.clientOptions.challenges).find(
      (cid) => cid === message.mentions.roles.first()?.id
    );

    if (challengeRoleId === undefined) {
      return fail(message, "invalidChallenge");
    }

    console.log(proof);

    message.react("📨");
  }
} as Event<"messageCreate">;
