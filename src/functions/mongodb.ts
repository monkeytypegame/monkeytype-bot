/** @format */

import { MongoClient } from "mongodb";

let mongoClient: MongoClient;

export async function connectDB() {
  return MongoClient.connect(process.env["DB_URI"] as string)
    .then((client) => (mongoClient = client))
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });
}

export function mongoDB() {
  return mongoClient.db(process.env["DB_NAME"]);
}
