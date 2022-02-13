import { Client } from "./structures/Client";
import { ClientOptions } from "./interfaces/ClientOptions";
import { config } from "dotenv";
import { connectDB } from "./functions/connectDB";
import clientOptions from "./config/config.json";

console.clear();

config();

const client = new Client(clientOptions as ClientOptions);

client.start(process.env["TOKEN"] as string).then(console.log);

connectDB().then(() => console.log("Database connected"));
