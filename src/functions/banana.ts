import fs from "fs";
import { BananaEntry, BananaData } from "../types";

export function getUser(userID: string): BananaEntry | undefined {
  const data = getData();

  return data[userID];
}

export function setUser(userID: string, banana: BananaEntry): void {
  const data = getData();

  data[userID] = banana;

  setData(data);
}

export function createUser(
  userID: string,
  initialBal: number = 1
): BananaEntry {
  const data = getData();

  const user = data[userID];

  if (user !== undefined) return user;

  const newUser: BananaEntry = {
    balance: initialBal,
    lastCollect: 0,
    flipLosses: 0,
    flipWins: 0,
    bananajackLosses: 0,
    rpsWins: 0,
    rpsLosses: 0,
    rpsTies: 0,
    bananajackTies: 0,
    bananajackWins: 0
  };

  data[userID] = newUser;

  setData(data);

  return newUser;
}

export function getData(): BananaData {
  return JSON.parse(fs.readFileSync("bananas.json").toString());
}

export function setData(bananaData: BananaData) {
  fs.writeFileSync("bananas.json", JSON.stringify(bananaData));
}
