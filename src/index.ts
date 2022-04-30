/** @format */

import { Client } from "./structures/Client";
import { ClientOptions } from "./interfaces/ClientOptions";
import { config } from "dotenv";
import clientOptions from "./config/config.json";
import fetch from "node-fetch";
import * as fs from "fs";
import _ from "lodash";

console.clear();

interface GitHubLabel {
  name: string;
}

function fetchLabels() {
  console.log("Fetching GitHub labels...");

  fetch(`https://api.github.com/repos/${clientOptions.repo}/labels`)
    .then((response) => response.json())
    .then((json: GitHubLabel[]) => {
      if (!_.isArray(json)) {
        console.log(
          "Could not fetch labels from GitHub, might be rate limited"
        );

        return;
      }

      const labelNames = json.map((label) => label.name);

      fs.writeFileSync("labels.json", JSON.stringify(labelNames, null, 2));

      console.log("Labels updated!");
    });
}

fetchLabels();

setInterval(fetchLabels, 3600000);

config();

const client = new Client<false>(clientOptions as ClientOptions);

client.start(process.env["TOKEN"] as string).then(console.log);
