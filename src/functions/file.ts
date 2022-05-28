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
    return;
  }

  return fs.readFileSync(fileName).toString();
}

export function parseJSON<T>(data: string | undefined, defaultData: T): T;
export function parseJSON<T>(data: string): T;
export function parseJSON<T>(data?: string, defaultData?: T): T | undefined {
  if (data === undefined) {
    return defaultData;
  }
  return JSON.parse(data);
}
