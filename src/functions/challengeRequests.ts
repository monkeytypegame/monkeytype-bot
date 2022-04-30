/** @format */
import * as fs from "fs";
import { parseJSON, readFileOrCreate } from "../functions/file";

interface ChallengeRequest {
  userId: string;
  messageId: string;
  challengeId: string;
  timestamp: number;
}

export function getRequests(): ChallengeRequest[] {
  return parseJSON(readFileOrCreate("challengeRequests.json", "[]").toString());
}

export function pushRequest(data: ChallengeRequest): void {
  const requests = getRequests();
  requests.push(data);
  fs.writeFileSync("challengeRequests.json", JSON.stringify(requests, null, 2));
}
