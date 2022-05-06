/** @format */

import type { MonkeyTypes } from "../types/types";
import { mongoDB } from "../functions/mongodb";

export async function getStats(): Promise<MonkeyTypes.ChallengeRequestStats[]> {
  return await mongoDB()
    .collection<MonkeyTypes.ChallengeRequestStats>(
      "bot-challenge-requests-stats"
    )
    .find()
    .toArray();
}

export async function incrementApproved(userID: string): Promise<void> {
  mongoDB()
    .collection("bot-challenge-requests-stats")
    .updateOne(
      { userID },
      {
        $inc: { accepted: 1 },
        $set: { lastAccepted: Date.now() }
      },
      { upsert: true }
    );
}

export async function incrementDenied(userID: string): Promise<void> {
  mongoDB()
    .collection("bot-challenge-requests-stats")
    .updateOne(
      { userID },
      {
        $inc: { denied: 1 },
        $set: { lastDenied: Date.now() }
      },
      { upsert: true }
    );
}
