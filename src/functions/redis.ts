import Redis from "ioredis";

let redisClient: Redis;

export async function connectRedis(): Promise<Redis> {
  const redisURI = process.env["REDIS_URI"];

  if (!redisURI) {
    console.log("No REDIS_URI found in environment variables");
    process.exit(1);
  }

  redisClient = new Redis(redisURI, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    enableReadyCheck: false
  });

  return redisClient;
}

export function redis(): Redis {
  return redisClient;
}
