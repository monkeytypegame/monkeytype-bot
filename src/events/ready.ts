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
  Guild
} from "discord.js";
import fetch from "node-fetch";

export default {
  event: "ready",
  run: async (client) => {
    console.log(`${client.user.tag} is online!`);
    const guild = await client.guild;

    if (guild === undefined) {
      return;
    }

    client.user.setActivity(`over ${getMemberCount(guild)} monkeys`, {
      type: "WATCHING"
    });

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

    connectDB().then(() => console.log("Database connected"));
    connectRedis().then(async () => {
      console.log("Redis connected");

      client.initWorker();
    });

    fetchLabels(client);

    setInterval(() => {
      client.user.setActivity(`over ${getMemberCount(guild)} monkeys`, {
        type: "WATCHING"
      });

      fetchLabels(client);
    }, 3600000);
  }
} as MonkeyTypes.Event<"ready">;

interface GitHubLabel {
  name: string;
}

async function fetchLabels(client: Client<true>): Promise<void> {
  console.log("Fetching GitHub labels...");

  const response = await fetch(
    `https://api.github.com/repos/${client.clientOptions.repo}/labels`
  );
  const json: GitHubLabel[] = (await response.json()) as GitHubLabel[];

  if (!_.isArray(json)) {
    console.log("Could not fetch labels from GitHub, might be rate limited");

    return;
  }

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

function getMemberCount(guild: Guild): number {
  return (
    guild.presences?.cache.map((presence) => presence.status === "online")
      .length ?? guild.memberCount
  );
}
