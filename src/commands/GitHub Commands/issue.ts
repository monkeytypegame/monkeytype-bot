/** @format */

import { Command, RolesEnum } from "../../interfaces/Command";
import labels from "../../../labels.json";
import fetch from "node-fetch-commonjs";

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
  roles: [RolesEnum.COLLABORATOR, RolesEnum.MODERATOR, RolesEnum.ADMINISTRATOR],
  options: [
    {
      name: "name",
      description: "The name of the issue",
      type: "STRING",
      required: true
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
    },
    {
      name: "description",
      description: "The description of the issue",
      type: "STRING",
      required: false
    }
  ],
  run: async (interaction, client) => {
    if (apiToken === undefined) {
      interaction.reply({
        content: "The bot does not have a github api token attached!"
      });

      return;
    }

    interaction.deferReply({ fetchReply: false });

    const name = interaction.options.getString("name", true);

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

    const description = interaction.options.getString("description", false);

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
        title: name,
        body: description ?? undefined,
        labels: lbls.length !== 0 ? lbls : undefined
      })
    });

    if (response.ok) {
      interaction.followUp(
        `Created issue \`${name}\` with description \`${description}\` and labels \`${lbls.join(
          ", "
        )}\`.`
      );
    } else {
      interaction.followUp("Could not create issue");
    }
  }
} as Command;
