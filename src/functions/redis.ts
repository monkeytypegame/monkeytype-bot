/** @format */

import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

export async function connectRedis() {
  const redisURI = process.env["REDIS_URI"];

  if (!redisURI) {
    console.log("No REDIS_URI found in environment variables");
    process.exit(1);
  }

  const client = createClient({ url: redisURI });

  await client.connect().catch((err) => {
    console.log(err);
    process.exit(1);
  });

  if (client) {
    redisClient = client;
  }

  return redisClient;
}

export function redis() {
  return redisClient;
}
