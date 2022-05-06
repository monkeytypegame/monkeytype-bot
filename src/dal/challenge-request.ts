/** @format */

import type { MonkeyTypes } from "../types/types";
import { mongoDB } from "../functions/mongodb";

export async function getRequestCount(): Promise<number> {
  return await mongoDB().collection("bot-challenge-requests").countDocuments();
}

export async function getRequests(): Promise<MonkeyTypes.ChallengeRequest[]> {
  return await mongoDB().collection("bot-challenge-requests").find().toArray();
}

export async function addRequest(
  data: MonkeyTypes.ChallengeRequest
): Promise<void> {
  await mongoDB().collection("bot-challenge-requests").insertOne(data);
}

export async function getRequest(
  userID: string,
  messageID: string
): Promise<MonkeyTypes.ChallengeRequest | undefined> {
  return await mongoDB()
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
