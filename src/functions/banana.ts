/** @format */

import * as fs from "fs";
import type { MonkeyTypes } from "../types/types";
import { parseJSON, readFileOrCreate } from "./file";

export function getUser(userID: string): MonkeyTypes.BananaEntry | undefined {
  const data = getData();

  const user = data[userID];

  if (user === undefined) {
    return;
  }

  return partialToFull(user);
}

export function setUser(
  userID: string,
  bananaEntry: MonkeyTypes.BananaEntry
): void {
  const data = getData();

  data[userID] = shakePartial(bananaEntry);

  setData(data);
}

export function createUser(
  userID: string,
  initialBal = 1
): MonkeyTypes.BananaEntry {
  const data = getData();

  const user = data[userID];

  if (user !== undefined) {
    return partialToFull(user);
  }

  const newUser: Partial<MonkeyTypes.BananaEntry> = {
    balance: initialBal
  };

  data[userID] = newUser;

  setData(data);

  return partialToFull(newUser);
}

export function getData(): MonkeyTypes.BananaData {
  return parseJSON<MonkeyTypes.BananaData>(
    readFileOrCreate("bananas.json", "{}")
  );
}

function setData(bananaData: MonkeyTypes.BananaData) {
  fs.writeFileSync("bananas.json", JSON.stringify(bananaData, null, 2));
}

function partialToFull(
  partial: Partial<MonkeyTypes.BananaEntry>
): MonkeyTypes.BananaEntry {
  return {
    balance: partial.balance ?? 0,
    lastCollect: partial.lastCollect ?? 0,
    flipLosses: partial.flipLosses ?? 0,
    flipWins: partial.flipWins ?? 0,
    bananajackLosses: partial.bananajackLosses ?? 0,
    rpsWins: partial.rpsWins ?? 0,
    rpsLosses: partial.rpsLosses ?? 0,
    rpsTies: partial.rpsTies ?? 0,
    bananajackTies: partial.bananajackTies ?? 0,
    bananajackWins: partial.bananajackWins ?? 0
  };
}

function shakePartial(
  partial: Partial<MonkeyTypes.BananaEntry>
): Partial<MonkeyTypes.BananaEntry> {
  if (partial.lastCollect === 0) {
    delete partial.lastCollect;
  }
  if (partial.flipLosses === 0) {
    delete partial.flipLosses;
  }
  if (partial.flipWins === 0) {
    delete partial.flipWins;
  }
  if (partial.bananajackLosses === 0) {
    delete partial.bananajackLosses;
  }
  if (partial.rpsWins === 0) {
    delete partial.rpsWins;
  }
  if (partial.rpsLosses === 0) {
    delete partial.rpsLosses;
  }
  if (partial.rpsTies === 0) {
    delete partial.rpsTies;
  }
  if (partial.bananajackTies === 0) {
    delete partial.bananajackTies;
  }
  if (partial.bananajackWins === 0) {
    delete partial.bananajackWins;
  }

  return partial;
}

export function getCoinFlips(): MonkeyTypes.CoinFlip[] {
  return parseJSON<MonkeyTypes.CoinFlip[]>(
    readFileOrCreate("coinFlips.json", "[]")
  );
}

export function setCoinFlips(coinFlips: MonkeyTypes.CoinFlip[]): void {
  fs.writeFileSync("coinFlips.json", JSON.stringify(coinFlips, null, 2));
}
