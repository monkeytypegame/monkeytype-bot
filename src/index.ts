import { Client } from "./structures/Client";
import { ClientOptions } from "./interfaces/ClientOptions";
import { config } from "dotenv";
import clientOptions from "./config/config.json";
import fetch from "node-fetch";
import * as fs from "fs";

interface GitHubLabel {
  name: string;
}

fetch(`https://api.github.com/repos/${clientOptions.repo}/labels`)
  .then((response) => response.json())
  .then((json: GitHubLabel[]) =>
    fs.writeFileSync("src/labels.json", JSON.stringify(json.map((v) => v.name)))
  );

console.clear();

config();

const client = new Client(clientOptions as ClientOptions);

client.start(process.env["TOKEN"] as string).then(console.log);