import type { MonkeyTypes } from "../types/types";
import { mongoDB } from "../utils/mongodb";

export function getRequestCount(): Promise<number> {
  return mongoDB().collection("bot-challenge-requests").countDocuments();
}

export function getRequests(): Promise<MonkeyTypes.ChallengeRequest[]> {
  return mongoDB().collection("bot-challenge-requests").find().toArray();
}

export function addRequest(data: MonkeyTypes.ChallengeRequest): void {
  mongoDB().collection("bot-challenge-requests").insertOne(data);
}

export function getRequest(
  userID: string,
  messageID: string
): Promise<MonkeyTypes.ChallengeRequest | undefined> {
  return mongoDB()
    .collection<MonkeyTypes.ChallengeRequest>("bot-challenge-requests")
    .findOne({
      userID,
      messageID
    });
}

export async function deleteRequest(
  userID: string,
  messageID: string
): Promise<void> {
  await mongoDB().collection("bot-challenge-requests").deleteOne({
    userID,
    messageID
  });
}
