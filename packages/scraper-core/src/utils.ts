import type { ParsedDateRange } from './types';

const MONTH_LOOKUP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export const cleanText = (value: string) => value.replace(/\s+/g, ' ').trim();

export const truncateText = (value: string, maxLength: number) => {
  const cleaned = cleanText(value);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
};

export const uniqueBy = <T>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  const results: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(item);
  }

  return results;
};

export const mapWithConcurrency = async <T, U>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<U>,
) => {
  if (items.length === 0) {
    return [] as U[];
  }

  const results = new Array<U>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
};

const parseMonth = (monthText: string) => {
  const monthKey = monthText.toLowerCase();
  const month = MONTH_LOOKUP[monthKey] ?? MONTH_LOOKUP[monthKey.slice(0, 3)];
  if (month === undefined) {
    throw new Error(`Unsupported month: ${monthText}`);
  }

  return month;
};

const toYear = (yearText: string) => {
  const year = Number(yearText);
  if (yearText.length === 2) {
    return year >= 70 ? 1900 + year : 2000 + year;
  }

  return year;
};

const toTwelveHourDate = (
  month: string,
  day: string,
  year: string,
  hour: string,
  minute: string,
  meridiem: string,
  offsetMinutes = 0,
) => {
  let normalizedHour = Number(hour) % 12;
  if (meridiem.toUpperCase() === 'PM') {
    normalizedHour += 12;
  }

  const utcMilliseconds = Date.UTC(
    toYear(year),
    parseMonth(month),
    Number(day),
    normalizedHour,
    Number(minute),
  );
  return new Date(utcMilliseconds - offsetMinutes * 60_000);
};

export const parseUnstopDate = (value: string) => {
  const match = value.match(
    /(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*IST/i,
  );
  if (!match) {
    return null;
  }

  return toTwelveHourDate(match[2], match[1], match[3], match[4], match[5], match[6], 330);
};

export const parseUnstopDateRange = (value: string): ParsedDateRange | null => {
  const matches = Array.from(
    value.matchAll(
      /(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4},\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*IST)\s*--?>\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4},\s*\d{1,2}:\d{2}\s*(?:AM|PM)\s*IST)/gi,
    ),
  );

  if (matches.length === 0) {
    return null;
  }

  const parsedRanges = matches
    .map((match) => {
      const startTime = parseUnstopDate(match[1]);
      const endTime = parseUnstopDate(match[2]);
      if (!startTime || !endTime) {
        return null;
      }

      return { startTime, endTime };
    })
    .filter((range): range is ParsedDateRange => Boolean(range));

  if (parsedRanges.length === 0) {
    return null;
  }

  return parsedRanges.reduce<ParsedDateRange>(
    (current, candidate) => ({
      startTime: candidate.startTime < current.startTime ? candidate.startTime : current.startTime,
      endTime: candidate.endTime > current.endTime ? candidate.endTime : current.endTime,
    }),
    parsedRanges[0],
  );
};

export const parseDateRangeFromText = (value: string): ParsedDateRange | null => {
  const rangeMatch = value.match(
    /([A-Za-z]{3,9})\s+(\d{1,2})\s*-\s*([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/,
  );
  if (!rangeMatch) {
    return null;
  }

  const startTime = new Date(
    Date.UTC(toYear(rangeMatch[5]), parseMonth(rangeMatch[1]), Number(rangeMatch[2])),
  );
  const endTime = new Date(
    Date.UTC(toYear(rangeMatch[5]), parseMonth(rangeMatch[3]), Number(rangeMatch[4]), 23, 59, 59),
  );

  return { startTime, endTime };
};

export const parseDevpostDateRange = (value: string): ParsedDateRange | null => {
  const matchedValue = value.match(
    /([A-Za-z]{3,9})\s+(\d{1,2})\s*-\s*([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/,
  );
  if (!matchedValue) {
    return null;
  }

  return {
    startTime: new Date(
      Date.UTC(toYear(matchedValue[5]), parseMonth(matchedValue[1]), Number(matchedValue[2])),
    ),
    endTime: new Date(
      Date.UTC(
        toYear(matchedValue[5]),
        parseMonth(matchedValue[3]),
        Number(matchedValue[4]),
        23,
        59,
        59,
      ),
    ),
  };
};

export const parseDevpostDeadline = (value: string): Date | null => {
  const matchedValue = value.match(
    /([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\s*@\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*GMT\+?([\d:]+)/i,
  );
  if (!matchedValue) {
    return null;
  }

  let hour = Number(matchedValue[4]) % 12;
  if (matchedValue[6].toLowerCase() === 'pm') {
    hour += 12;
  }

  const offsetText = matchedValue[7];
  const [offsetHoursText, offsetMinutesText = '0'] = offsetText.split(':');
  const offsetMinutes = Number(offsetHoursText) * 60 + Number(offsetMinutesText);
  const utcMilliseconds = Date.UTC(
    toYear(matchedValue[3]),
    parseMonth(matchedValue[1]),
    Number(matchedValue[2]),
    hour,
    Number(matchedValue[5]),
  );

  return new Date(utcMilliseconds - offsetMinutes * 60_000);
};

export const parseRelativeDeadline = (value: string) => {
  const relativeMatch = value.match(
    /Posted\s+[A-Za-z]{3}\s+\d{1,2},\s*\d{4}\s+(\d+)\s+(minutes?|hours?|days?|weeks?|months?)\s+left/i,
  );
  if (!relativeMatch) {
    return null;
  }

  const referenceDate = new Date();
  const amount = Number(relativeMatch[1]);
  const unit = relativeMatch[2].toLowerCase();
  const deadline = new Date(referenceDate.getTime());

  switch (unit) {
    case 'minute':
    case 'minutes':
      deadline.setMinutes(deadline.getMinutes() + amount);
      break;
    case 'hour':
    case 'hours':
      deadline.setHours(deadline.getHours() + amount);
      break;
    case 'day':
    case 'days':
      deadline.setDate(deadline.getDate() + amount);
      break;
    case 'week':
    case 'weeks':
      deadline.setDate(deadline.getDate() + amount * 7);
      break;
    case 'month':
    case 'months':
      deadline.setMonth(deadline.getMonth() + amount);
      break;
    default:
      return null;
  }

  return { referenceDate, deadline };
};
