const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Parses an API `DateOnly` (`yyyy-MM-dd`) as a local date, free of timezone drift. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

/** Serialises a `Date` back to the API's `DateOnly` shape. */
export function toDateOnly(value: Date): string {
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${value.getFullYear()}-${month}-${day}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month - 1] ?? ''} ${year}`;
}

export function shortMonthLabel(year: number, month: number): string {
  return `${(MONTHS[month - 1] ?? '').slice(0, 3)} ${year}`;
}

/** "Saturday 14 March" — the day heading used in the ledger. */
export function dayLabel(value: string): string {
  const date = parseDateOnly(value);

  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Days elapsed in the month, so a daily average never divides by the whole month too early. */
export function daysElapsed(year: number, month: number): number {
  const now = new Date();
  const isCurrent = now.getFullYear() === year && now.getMonth() + 1 === month;

  if (isCurrent) {
    return now.getDate();
  }

  const isFuture = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1);

  return isFuture ? 0 : daysInMonth(year, month);
}
