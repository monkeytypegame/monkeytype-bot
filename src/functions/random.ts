export function randomInteger(min: number, max: number): number {
  return Math.floor(randomFloat(min, max));
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min + 1) + min;
}

export function randomBoolean(): boolean {
  return Math.round(Math.random()) === 1;
}
