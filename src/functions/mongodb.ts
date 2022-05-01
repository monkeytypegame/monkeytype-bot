/** @format */

import { MongoClient } from "mongodb";

let mongoClient: MongoClient;

export async function connectDB() {
  const dbURI = process.env["DB_URI"];

  if (!dbURI) {
    console.log("No DB_URI found in environment variables");
    process.exit(1);
  }

  const client = await MongoClient.connect(dbURI).catch((err) => {
    console.log(err);
    process.exit(1);
  });

  if (client) {
    mongoClient = client;
  }

  return mongoClient;
}

export function mongoDB() {
  return mongoClient.db(process.env["DB_NAME"]);
}
