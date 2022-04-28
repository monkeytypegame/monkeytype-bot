/** @format */

import { Command } from "../../interfaces/Command";
import { readFileSync } from "fs";
import fetch from "node-fetch-commonjs";

const labels: string[] = JSON.parse(readFileSync("./labels.json").toString());

const labelOption = {
  description: "Add a label to the issue",
  type: "STRING",
  required: false,
  choices: labels.map((label) => ({
    name: label,
    value: label
  }))
};

const apiToken = process.env["GITHUB_API_TOKEN"];

export default {
  name: "issue",
  description: "Send an issue to GitHub",
  category: "GitHub",
  options: [
    {
      name: "title",
      description: "The issue title",
      type: "STRING",
      required: true
    },
    {
      name: "body",
      description: "The issue body",
      type: "STRING",
      required: false
    },
    {
      name: "label1",
      ...labelOption
    },
    {
      name: "label2",
      ...labelOption
    },
    {
      name: "label3",
      ...labelOption
    }
  ],
  needsPermissions: true,
  run: async (interaction, client) => {
    if (apiToken === undefined) {
      interaction.reply({
        content: "The bot does not have a github api token attached!"
      });

      return;
    }

    interaction.deferReply({ fetchReply: false });

    const title = interaction.options.getString("title", true);

    const label1 = interaction.options.getString("label1", false);
    const label2 = interaction.options.getString("label2", false);
    const label3 = interaction.options.getString("label3", false);

    const lbls: string[] = [];

    if (label1 !== null) {
      lbls.push(label1);
    }
    if (label2 !== null) {
      lbls.push(label2);
    }
    if (label3 !== null) {
      lbls.push(label3);
    }

    const body = interaction.options.getString("body", false);

    const apiIssuesURL = `https://api.github.com/repos/${client.clientOptions.repo}/issues`;

    const response = await fetch(apiIssuesURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${apiToken}`,
        accept: "application/vnd.github.v3+json"
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({
        title,
        body,
        labels: lbls.length !== 0 ? lbls : undefined
      })
    });

    if (response.ok) {
      interaction.followUp(
        `Created issue \`${title}\` with body \`${body}\` and labels \`${lbls.join(
          ", "
        )}\`.`
      );
    } else {
      interaction.followUp("Could not create issue");
    }
  }
} as Command;
