export function addDays(date: Date | number, days: number): Date {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + days);

  return newDate;
}

export function getNextDay(date: Date | number): Date {
  const newDate = new Date(date);

  newDate.setDate(newDate.getDate() + 1);

  newDate.setHours(0);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);

  return newDate;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
