export function toPascalCase(string: string): string {
  return string
    .split(/[ _]+/)
    .map((v) => v[0]?.toUpperCase() + v.substring(1).toLowerCase())
    .join(" ");
}

export function getPositionString(position: number): string {
  const t = position % 10;
  const h = position % 100;

  if (t === 1 && h !== 11) {
    return `${position}st`;
  } else if (t === 2 && h !== 12) {
    return `${position}nd`;
  } else if (t === 3 && h !== 13) {
    return `${position}rd`;
  }

  return `${position}th`;
}
