/** @format */

import _ from "lodash";
import { connectDB } from "../functions/mongodb";
import { connectRedis } from "../functions/redis";
import * as fs from "fs";
import type { MonkeyTypes } from "../types/types";
import { parseJSON, readFileOrCreate } from "../functions/file";
import { Client } from "../structures/client";
import {
  ApplicationCommandChoicesOption,
  ApplicationCommandData,
  ApplicationCommandOption,
  Guild,
  MessageEmbed,
  MessageEmbedOptions
} from "discord.js";
import fetch from "node-fetch-commonjs";

const HOUR = 60 * 60 * 1000;

export default {
  event: "ready",
  run: async (client) => {
    console.log(`${client.user.tag} is online!`);
    sendReadyMessage(client);

    const guild = await client.guild;

    if (guild === undefined) {
      console.log("Could not get guild");

      return;
    }

    connectDatabases(client);

    const func = (): void => {
      setActivity(client, guild);
      fetchLabels(client);
      fetchLatestRelease(client);
    };

    func();

    setInterval(func, HOUR);
  }
} as MonkeyTypes.Event<"ready">;

async function fetchLabels(client: Client<true>): Promise<void> {
  console.log("Fetching GitHub labels...");

  const response = await fetch(
    `https://api.github.com/repos/${client.clientOptions.repo}/labels`
  );

  if (response.status !== 200) {
    console.log(`Could not fetch labels:\n${response.statusText}`);

    return;
  }

  const json = (await response.json()) as MonkeyTypes.GitHubLabel[];

  const labelNames = json.map((label) => label.name);

  fs.writeFileSync("labels.json", JSON.stringify(labelNames, null, 2));

  console.log("Labels updated!");

  updateIssueCommand(client);
}

async function updateIssueCommand(client: Client<true>): Promise<void> {
  console.log("Updating issue command...");

  const labels = parseJSON<string[]>(readFileOrCreate("labels.json", "[]"));

  const labelOption: ApplicationCommandOption = {
    name: "label",
    description: "Add a label to the issue",
    type: "STRING",
    required: false,
    choices: labels.map((label) => ({
      name: label,
      value: label
    }))
  };

  const issueCommand = client.application.commands.cache.find(
    (command) => command.name === "issue"
  );

  if (issueCommand === undefined) {
    console.log("Could not find issue command");

    return;
  }

  if (
    _.isEqual(
      (issueCommand.options[2] as ApplicationCommandChoicesOption).choices,
      labelOption.choices
    )
  ) {
    console.log("Issue command already up to date");

    return;
  }

  issueCommand.options = [
    ...issueCommand.options.slice(0, 2),
    {
      ...labelOption,
      name: "label1"
    },
    {
      ...labelOption,
      name: "label2"
    },
    {
      ...labelOption,
      name: "label3"
    }
  ];

  await issueCommand.edit(issueCommand as ApplicationCommandData);

  console.log("Issue command updated!");
}

async function fetchLatestRelease(client: Client<true>): Promise<void> {
  console.log("Fetching latest release...");

  const channel = await client.getChannel("updates");

  if (channel === undefined) {
    console.log("Could not get update channel");

    return;
  }

  const response = await fetch(
    `https://api.github.com/repos/${client.clientOptions.repo}/releases/latest`
  );

  if (response.status !== 200) {
    console.log(`Could not fetch latest release:\n${response.statusText}`);

    return;
  }

  const json = (await response.json()) as MonkeyTypes.GitHubRelease;

  const { name, body, created_at } = json;

  const createdAt = new Date(created_at);

  if (Date.now() - createdAt.getTime() > HOUR) {
    console.log("Latest release is too old");

    return;
  }

  const embeds = createEmbeds(name, body, client, createdAt);

  for (const embed of embeds) {
    channel.send({ embeds: [embed] }).catch((err) => console.log(err));
  }
}

function createEmbeds(
  name: string,
  description: string,
  client: Client<true>,
  createdAt: Date,
  first = true
): MessageEmbed[] {
  const options: MessageEmbedOptions = {
    title: `${name}${first ? "" : " (continued)"}`,
    timestamp: createdAt,
    color: 0xe2b714
  };

  const maxLength = 4096;

  if (description.length < maxLength) {
    return [
      client.embed({
        ...options,
        description
      })
    ];
  }

  const length = description.substring(0, maxLength).lastIndexOf("\n");

  return [
    client.embed({
      ...options,
      description: description.substring(0, length)
    }),
    ...createEmbeds(
      name,
      description.substring(length),
      client,
      createdAt,
      false
    )
  ];
}

async function connectDatabases(client: Client<true>): Promise<void> {
  console.log("Connecting to databases...");

  await connectDB();
  console.log("Database connected");

  await connectRedis();
  console.log("Redis connected");
  client.initWorker();
}

async function sendReadyMessage(client: Client<true>): Promise<void> {
  const botOwner = await client.users.fetch(client.clientOptions.devID);

  client.logInBotLogChannel(
    client.clientOptions.dev
      ? "Ready!"
      : `${botOwner}, Ready! Make sure to unlock commands`
  );

  if (!client.clientOptions.dev) {
    botOwner
      .send("Ready! Make sure to unlock commands")
      .catch(() => console.log("Couldn't send ready message to owner"));
  }
}

function setActivity(client: Client<true>, guild: Guild): void {
  client.user.setActivity(`over ${getMemberCount(guild)} monkeys`, {
    type: "WATCHING"
  });
}

function getMemberCount(guild: Guild): number {
  return (
    guild.approximatePresenceCount ??
    guild.presences?.cache?.size ??
    guild.memberCount ??
    guild.approximateMemberCount
  );
}
