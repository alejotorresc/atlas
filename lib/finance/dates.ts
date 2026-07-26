import { addDays, addMonths, addQuarters, addWeeks, addYears, getDaysInMonth, setDate } from 'date-fns';
import type { RecurrenceFrequency } from '@/types/database';

/**
 * Resolves a target day-of-month against a given month, clamping to the last
 * valid day when the month is shorter (e.g. day 31 in February -> Feb 28/29).
 */
export function resolveDayOfMonth(year: number, monthIndexZeroBased: number, day: number): Date {
  const reference = new Date(Date.UTC(year, monthIndexZeroBased, 1));
  const daysInMonth = getDaysInMonth(reference);
  const clampedDay = Math.min(day, daysInMonth);
  return setDate(reference, clampedDay);
}

/** Next statement/payment date on or after `from`, for a fixed day-of-month. */
export function nextMonthlyDayOccurrence(from: Date, day: number): Date {
  const candidate = resolveDayOfMonth(from.getUTCFullYear(), from.getUTCMonth(), day);
  if (candidate >= startOfUtcDay(from)) {
    return candidate;
  }
  return resolveDayOfMonth(from.getUTCFullYear(), from.getUTCMonth() + 1, day);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function nextRecurrenceDate(current: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(current, 1);
    case 'biweekly':
      return addWeeks(current, 2);
    case 'monthly':
      return addMonths(current, 1);
    case 'quarterly':
      return addQuarters(current, 1);
    case 'yearly':
      return addYears(current, 1);
  }
}

export function addDaysUtc(date: Date, days: number): Date {
  return addDays(date, days);
}
