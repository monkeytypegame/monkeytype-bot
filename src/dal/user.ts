import { MonkeyTypes } from "../types/types";
import { mongoDB } from "../utils/mongodb";

export async function findUserByDiscordId(
  discordUserId: string
): Promise<MonkeyTypes.User | undefined> {
  const db = mongoDB();

  const user = await db
    .collection<MonkeyTypes.User>("users")
    .findOne({ discordId: discordUserId });

  if (!user) {
    return undefined;
  }

  return user;
}
