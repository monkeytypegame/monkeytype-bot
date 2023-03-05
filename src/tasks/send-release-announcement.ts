import fetch from "node-fetch";
import type { MonkeyTypes } from "../types/types";
import { createChunks } from "../utils/chunks";

export default {
  name: "sendReleaseAnnouncement",
  run: async (client, guild, releaseID) => {
    console.log("Sent a new release, sending to #updates channel...");

    const channel = await client.getChannel("updates");

    if (channel === undefined) {
      return {
        status: false,
        message: "Could not get updates channel"
      };
    }

    const response = await fetch(
      `https://api.github.com/repos/${client.clientOptions.repo}/releases/${releaseID}`
    );

    if (response.status !== 200) {
      return {
        status: false,
        message: `Could not fetch the latest release:\n${response.statusText}`
      };
    }

    const release = (await response.json()) as MonkeyTypes.GitHubRelease;

    const updateRole = guild.roles.cache.get(
      client.clientOptions.roles.updatePingRole
    );

    if (updateRole === undefined) {
      return {
        status: false,
        message: "Could not get update ping role"
      };
    }

    await channel.send(`${updateRole}\n**Monkeytype ${release.name}**`);

    for (const message of createChunks(
      release.body,
      2000 - "```\n\n```".length,
      "\n\n"
    )) {
      await channel.send(`\`\`\`\n${message}\n\`\`\``);
    }

    return {
      status: true,
      message: "Successfully sent release"
    };
  }
} as MonkeyTypes.TaskFile;
