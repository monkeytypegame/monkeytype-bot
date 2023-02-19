import { Role } from "discord.js";
import fetch from "node-fetch";
import type { MonkeyTypes } from "../types/types";

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

    const json = (await response.json()) as MonkeyTypes.GitHubRelease;

    const updateRole = guild.roles.cache.get(
      client.clientOptions.roles.updatePingRole
    );

    if (updateRole === undefined) {
      return {
        status: false,
        message: "Could not get update ping role"
      };
    }

    for (const message of splitMessages(json, updateRole)) {
      await channel.send(message);
    }

    return {
      status: true,
      message: "Successfully sent release"
    };
  }
} as MonkeyTypes.TaskFile;

function* splitMessages(
  release: MonkeyTypes.GitHubRelease,
  updateRole: Role
): Generator<string> {
  const max = 2000 - "```\n\n```".length; // to account for the code block

  yield `${updateRole}\n**Monkeytype ${release.name}**`;

  const sections = release.body.split(/\n\n|\r\n\r\n/);

  while (sections.length > 0) {
    let message = "";

    while (sections.length > 0 && message.length + sections[0]!.length < max) {
      message += sections.shift() + "\n\n";
    }

    yield `\`\`\`\n${message.trim()}\n\`\`\``;
  }
}
