// all of these functions should be inclusive min and exclusive max

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInteger(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

export function randomBoolean(): boolean {
  return Math.round(Math.random()) === 1;
}

export function randomChance(percent: number): boolean {
  return randomFloat(0, 100) <= percent;
}
