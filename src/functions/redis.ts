/** @format */

import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env["REDIS_URI"]
});
