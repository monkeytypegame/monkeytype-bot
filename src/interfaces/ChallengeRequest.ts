/** @format */

export interface ChallengeRequest {
  userID: string;
  messageID: string;
  challengeRoleID: string;
  proof: string[];
  timestamp: number;
}
