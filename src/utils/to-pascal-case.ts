export function toPascalCase(str: string): string {
  return str
    .split(/[ _]+/)
    .map((v) => v[0]?.toUpperCase() + v.substring(1).toLowerCase())
    .join(" ");
}
