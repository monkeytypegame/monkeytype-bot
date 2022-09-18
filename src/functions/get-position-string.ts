export function getPositionString(pos: number): string {
  const t = pos % 10;
  const h = pos % 100;

  if (t === 1 && h !== 11) {
    return `${pos}st`;
  } else if (t === 2 && h !== 12) {
    return `${pos}nd`;
  } else if (t === 3 && h !== 13) {
    return `${pos}rd`;
  }

  return `${pos}th`;
}
