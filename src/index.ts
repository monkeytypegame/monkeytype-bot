/** @format */

import { Client } from "./structures/client";
import type { ClientOptions } from "./interfaces/client-options";
import { config } from "dotenv";
import clientOptions from "./config/config.json";

console.clear();

config();

const client = new Client(clientOptions as unknown as ClientOptions);

client.start(process.env["TOKEN"] as string).then(console.log);
