export function createChunks(
  whole: string,
  chunkLength: number,
  separator?: string
): string[];
export function createChunks<T>(whole: T[], chunkLength: number): T[][];
export function createChunks<T>(
  whole: string | T[],
  chunkLength: number,
  separator = "\n"
): (string | T[])[] {
  if (typeof whole === "string") {
    const chunks: string[] = [];
    const sections = whole.split(separator);

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

    for (let i = 0; i < whole.length; i += chunkLength) {
      chunks.push(whole.slice(i, i + chunkLength));
    }

    return chunks;
  }
}
