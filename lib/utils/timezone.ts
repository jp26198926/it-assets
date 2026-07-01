import { formatInTimeZone as tzFormat } from "date-fns-tz";

const DEFAULT_TZ = "UTC";

export function formatInAppTimezone(
  date: Date | string,
  formatStr: string,
  timezone?: string | null,
): string {
  return tzFormat(date, timezone || DEFAULT_TZ, formatStr);
}

export function startOfDayInTimezone(
  date: Date,
  timezone?: string | null,
): Date {
  const tz = timezone || DEFAULT_TZ;
  const dayStr = tzFormat(date, tz, "yyyy-MM-dd");
  return new Date(tzFormat(new Date(dayStr + "T00:00:00"), tz, "yyyy-MM-dd'T'HH:mm:ssXXX"));
}

export function endOfDayInTimezone(
  date: Date,
  timezone?: string | null,
): Date {
  const tz = timezone || DEFAULT_TZ;
  const dayStr = tzFormat(date, tz, "yyyy-MM-dd");
  return new Date(tzFormat(new Date(dayStr + "T23:59:59"), tz, "yyyy-MM-dd'T'HH:mm:ssXXX"));
}
