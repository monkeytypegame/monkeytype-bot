/** @format */
import type { ChallengeRequestStats } from "../interfaces/challenge-request";
import { mongoDB } from "../functions/mongodb";

export async function getStats(): Promise<ChallengeRequestStats[]> {
  return await mongoDB()
    .collection<ChallengeRequestStats>("bot-challenge-requests-stats")
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
