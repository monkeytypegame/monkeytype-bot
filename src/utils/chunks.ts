export function createChunks(
  string: string,
  chunkLength: number,
  separator?: string
): string[];
export function createChunks<T>(array: T[], chunkLength: number): T[][];
export function createChunks<T>(
  stringOrArray: string | T[],
  chunkLength: number,
  separator = "\n"
): (string | T[])[] {
  if (typeof stringOrArray === "string") {
    const chunks: string[] = [];
    const sections = stringOrArray.split(separator);

    while (sections.length > 0) {
      let chunk = "";

      while (
        sections.length > 0 &&
        chunk.length + separator.length + sections[0]!.length < chunkLength
      ) {
        chunk += sections.shift()! + separator;
      }

      chunks.push(chunk.trim());
    }

    return chunks;
  } else {
    const chunks: T[][] = [];

    for (let i = 0; i < stringOrArray.length; i += chunkLength) {
      chunks.push(stringOrArray.slice(i, i + chunkLength));
    }

    return chunks;
  }
}
