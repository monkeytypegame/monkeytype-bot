/** @format */
import * as fs from "fs";
import { parseJSON, readFileOrCreate } from "./file";
import type { ChallengeRequest } from "../interfaces/ChallengeRequest";

export function getRequestCount(): number {
  const data = getRequests();

  return data.length;
}

export function getRequests(): ChallengeRequest[] {
  return parseJSON(readFileOrCreate("challengeRequests.json", "[]"));
}

export function setRequests(challengeRequests: ChallengeRequest[]): void {
  fs.writeFileSync(
    "challengeRequests.json",
    JSON.stringify(challengeRequests, null, 2)
  );
}

export function addRequest(data: ChallengeRequest): void {
  const requests = getRequests();
  requests.push(data);
  setRequests(requests);
}

export function getRequest(
  userID: string,
  messageID: string
): ChallengeRequest | undefined {
  const requests = getRequests();
  return requests.find(
    (request) => request.userID === userID && request.messageID === messageID
  );
}

export function deleteRequest(userID: string, messageID: string): void {
  const requests = getRequests();
  const index = requests.findIndex(
    (request) => request.userID === userID && request.messageID === messageID
  );

  if (index === -1) {
    return;
  }

  requests.splice(index, 1);

  setRequests(requests);
}
