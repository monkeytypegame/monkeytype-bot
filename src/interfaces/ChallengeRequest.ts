/** @format */

import { WithId, Document } from "mongodb";

export interface ChallengeRequest extends WithId<Document> {
  userID: string;
  messageID: string;
  challengeRoleID: string;
  proof: string[];
  timestamp: number;
}
