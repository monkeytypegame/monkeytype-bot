/** @format */
import * as fs from "fs";
import { parseJSON, readFileOrCreate } from "./file";
import { ChallengeRequest } from "../interfaces/ChallengeRequest";

export function getRequests(): ChallengeRequest[] {
  return parseJSON(readFileOrCreate("challengeRequests.json", "[]").toString());
}

export function pushRequest(data: ChallengeRequest): void {
  const requests = getRequests();
  requests.push(data);
  fs.writeFileSync("challengeRequests.json", JSON.stringify(requests, null, 2));
}
