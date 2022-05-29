export function getPositionString(number: number): string {
  let numend = "th";
  const t = number % 10;
  const h = number % 100;
  if (t === 1 && h !== 11) {
    numend = "st";
  }
  if (t === 2 && h !== 12) {
    numend = "nd";
  }
  if (t === 3 && h !== 13) {
    numend = "rd";
  }
  return number + numend;
}
