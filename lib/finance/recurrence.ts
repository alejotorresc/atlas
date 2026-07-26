import { addMonths, isAfter, isBefore } from 'date-fns';
import type { RecurrenceFrequency } from '@/types/database';
import { nextRecurrenceDate, resolveDayOfMonth } from './dates';

const MONTH_STEP: Record<Extract<RecurrenceFrequency, 'monthly' | 'quarterly' | 'yearly'>, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export interface RecurringObligationLike {
  id: string;
  next_due_date: string;
  end_date: string | null;
  frequency: RecurrenceFrequency;
  amount_minor: number;
  is_active: boolean;
}

export interface GeneratedOccurrence {
  recurring_obligation_id: string;
  due_date: string;
  expected_amount_minor: number;
}

/**
 * Generates occurrence dates for an obligation from its next_due_date up to
 * `horizonEnd` (inclusive), respecting end_date and skipping inactive rules.
 * Existing due dates (already-generated occurrences) are excluded so the
 * caller can upsert-ignore-conflict without creating duplicates, and past
 * occurrences are never regenerated or removed.
 */
export function generateOccurrences(
  obligation: RecurringObligationLike,
  horizonEnd: Date,
  existingDueDates: Set<string>,
): GeneratedOccurrence[] {
  if (!obligation.is_active) return [];

  const occurrences: GeneratedOccurrence[] = [];
  const start = new Date(`${obligation.next_due_date}T00:00:00.000Z`);
  const end = obligation.end_date ? new Date(`${obligation.end_date}T00:00:00.000Z`) : null;

  const isMonthStepped = obligation.frequency === 'monthly' || obligation.frequency === 'quarterly' || obligation.frequency === 'yearly';

  // Monthly/quarterly/yearly always re-derive the date from the original
  // anchor day-of-month, instead of chaining off the previous (possibly
  // clamped) occurrence — otherwise a "day 31" obligation would drift to the
  // 28th/30th forever after the first short month (e.g. Jan 31 -> Feb 28 ->
  // Mar 28 instead of the correct Mar 31).
  const anchorDay = start.getUTCDate();
  const monthStep = isMonthStepped ? MONTH_STEP[obligation.frequency as 'monthly' | 'quarterly' | 'yearly'] : null;

  let cursor = start;
  let guard = 0;
  while (!isAfter(cursor, horizonEnd) && guard < 500) {
    if (end && isAfter(cursor, end)) break;

    const dueDateStr = cursor.toISOString().slice(0, 10);
    if (!existingDueDates.has(dueDateStr)) {
      occurrences.push({
        recurring_obligation_id: obligation.id,
        due_date: dueDateStr,
        expected_amount_minor: obligation.amount_minor,
      });
    }

    guard += 1;
    if (monthStep !== null) {
      cursor = resolveDayOfMonth(start.getUTCFullYear(), start.getUTCMonth() + monthStep * guard, anchorDay);
    } else {
      cursor = nextRecurrenceDate(cursor, obligation.frequency);
    }
  }

  return occurrences;
}

/** Default generation horizon: current month plus the next two months. */
export function defaultGenerationHorizon(from: Date): Date {
  return addMonths(from, 2);
}

export function isOverdue(dueDate: string, asOf: Date): boolean {
  return isBefore(new Date(`${dueDate}T00:00:00.000Z`), asOf);
}
