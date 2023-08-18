import fetch from "node-fetch";
import type { MonkeyTypes } from "../types/types";

export default {
  name: "sendReleaseAnnouncement",
  run: async (client, guild, releaseID) => {
    console.log(
      `Sent a new release (${releaseID}), sending to #updates channel...`
    );

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

    // const ping = `${updateRole}\n***monkeytype ${release.name}***`;

    // for (const message of createChunks(
    //   release.body,
    //   2000 - "```\n\n```".length,
    //   "\n\n"
    // )) {
    //   await channel.send(`\`\`\`\n${message}\n\`\`\``);
    // }

    //wrap all links in <> to prevent embeds
    release.body = release.body.replace(/\((https?:\/\/[^\s]+?)\)/g, "(<$1>)");

    const split = release.body.split(`\r\n\r\n###`);

    // const title = split.shift();

    for (let i = 0; i < split.length; i++) {
      split[i] = `###${split[i]}`;
    }

    const embeds = [];

    let invisibleLine = "";
    for (let i = 0; i < 2000; i++) {
      invisibleLine += " ";
    }

    for (const s of split) {
      const [t, l] = s.split("\r\n\r\n");
      const title = t?.replace("### ", "");
      embeds.push({
        title: title,
        description: invisibleLine + "\n" + l,
        color: 0xe2b714
      });
    }

    // await channel.send(ping + "\n" + title);
    // for (let i = 0; i < split.length; i++) {
    //   const message = split[i] as string;
    //   await channel.send(message);
    // }

    // await channel.send(ping);
    // await channel.send({
    //   content: `${updateRole}\n***monkeytype ${release.name}***\n${title}`,
    //   embeds: embeds
    // });

    await channel.send(
      `${updateRole}\nVersion **${release.name}** has been released! Check out the full change log here:\n${release.html_url}\nor by clicking the version number on the website.`
    );

    return {
      status: true,
      message: "Successfully sent release"
    };
  }
} as MonkeyTypes.TaskFile;
