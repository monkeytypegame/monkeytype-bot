/** @format */

import * as fs from "fs";

export function readFileOrCreate(
  fileName: string,
  defaultData: string
): string {
  if (!fs.existsSync(fileName)) {
    fs.writeFileSync(fileName, defaultData);
  }

  return fs.readFileSync(fileName).toString();
}

export function readOptionalFile(fileName: string): string | undefined {
  if (!fs.existsSync(fileName)) {
    return undefined;
  }

  return fs.readFileSync(fileName).toString();
}

export function parseJSON(data: string | undefined, defaultData?: object): any {
  if (data === undefined) {
    return defaultData ?? undefined;
  }
  return JSON.parse(data);
}
