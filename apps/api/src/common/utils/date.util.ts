const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

interface CalendarDateTimeParts extends CalendarDateParts {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

const saoPauloDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getSaoPauloParts(date: Date): CalendarDateTimeParts {
  const parts = Object.fromEntries(
    saoPauloDateTimeFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  ) as Record<string, number>;

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
    millisecond: date.getMilliseconds(),
  };
}

function saoPauloCalendarDateToUtc(parts: CalendarDateTimeParts): Date {
  const utcGuess = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      parts.millisecond,
    ),
  );
  const zonedGuessParts = getSaoPauloParts(utcGuess);
  const zonedGuessAsUtc = Date.UTC(
    zonedGuessParts.year,
    zonedGuessParts.month - 1,
    zonedGuessParts.day,
    zonedGuessParts.hour,
    zonedGuessParts.minute,
    zonedGuessParts.second,
    zonedGuessParts.millisecond,
  );
  const offset = zonedGuessAsUtc - utcGuess.getTime();

  return new Date(utcGuess.getTime() - offset);
}

function parseDateOnlyParts(value: string): CalendarDateParts | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return { year, month, day };
}

export function startOfSaoPauloCalendarDay(value: string): Date {
  const parts = parseDateOnlyParts(value);

  if (!parts) {
    return new Date(value);
  }

  return saoPauloCalendarDateToUtc({
    ...parts,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

export function endOfSaoPauloCalendarDay(value: string): Date {
  const parts = parseDateOnlyParts(value);

  if (!parts) {
    return new Date(value);
  }

  return saoPauloCalendarDateToUtc({
    ...parts,
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });
}

function startOfSaoPauloDayFromParts(parts: CalendarDateParts): Date {
  return saoPauloCalendarDateToUtc({
    ...parts,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

function endOfSaoPauloDayFromParts(parts: CalendarDateParts): Date {
  return saoPauloCalendarDateToUtc({
    ...parts,
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });
}

function addCalendarDays(parts: CalendarDateParts, amount: number) {
  const date = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + amount),
  );

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function getDatesFromPeriod(
  period: 'today' | 'week' | 'month' | 'year' | 'custom',
  start?: string,
  end?: string,
): { startDate: Date; endDate: Date } {
  const today = getSaoPauloParts(new Date());
  let startParts: CalendarDateParts = today;
  const endParts: CalendarDateParts = today;

  if (period === 'today') {
    startParts = today;
  } else if (period === 'week') {
    const day = startOfSaoPauloDayFromParts(today).getUTCDay();
    startParts = addCalendarDays(today, -day);
  } else if (period === 'month') {
    startParts = { ...today, day: 1 };
  } else if (period === 'year') {
    startParts = { year: today.year, month: 1, day: 1 };
  } else if (period === 'custom' && start && end) {
    return {
      startDate: startOfSaoPauloCalendarDay(start),
      endDate: endOfSaoPauloCalendarDay(end),
    };
  }

  return {
    startDate: startOfSaoPauloDayFromParts(startParts),
    endDate: endOfSaoPauloDayFromParts(endParts),
  };
}

export function getDaysArray(start: Date, end: Date): string[] {
  const arr: string[] = [];
  const dt = new Date(start);
  while (dt <= end) {
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    arr.push(`${year}-${month}-${day}`);
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
}
