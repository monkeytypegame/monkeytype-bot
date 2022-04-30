/** @format */

export interface ChallengeRequest {
  userId: string;
  messageId: string;
  challengeRoleId: string;
  proof: string[];
  timestamp: number;
}
