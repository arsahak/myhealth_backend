import { env } from "../config/env";

// Days are stored as "YYYY-MM-DD" keys so a day never shifts with time zones.
export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isDateKey = (value: unknown): value is string => {
  if (typeof value !== "string" || !DATE_KEY_REGEX.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};

/** Day of week for a date key: 0 = Sunday ... 6 = Saturday. */
export const dayOfWeek = (key: string): number => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** Today's date key in the app's time zone. */
export const todayKey = (now = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: env.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
