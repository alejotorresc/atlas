import { describe, expect, it } from 'vitest';
import { nextMonthlyDayOccurrence, resolveDayOfMonth } from './dates';

describe('resolveDayOfMonth', () => {
  it('uses the final valid day for February in a non-leap year', () => {
    const date = resolveDayOfMonth(2026, 1, 31);
    expect(date.getUTCDate()).toBe(28);
  });

  it('uses the final valid day for February in a leap year', () => {
    const date = resolveDayOfMonth(2028, 1, 31);
    expect(date.getUTCDate()).toBe(29);
  });

  it('uses day 30 for months with only 30 days', () => {
    const date = resolveDayOfMonth(2026, 3, 31); // April
    expect(date.getUTCDate()).toBe(30);
  });

  it('keeps the exact day for months long enough', () => {
    const date = resolveDayOfMonth(2026, 0, 31); // January
    expect(date.getUTCDate()).toBe(31);
  });
});

describe('nextMonthlyDayOccurrence', () => {
  it('returns this month if the day has not passed yet', () => {
    const from = new Date(Date.UTC(2026, 6, 10)); // July 10
    const next = nextMonthlyDayOccurrence(from, 15);
    expect(next.getUTCMonth()).toBe(6);
    expect(next.getUTCDate()).toBe(15);
  });

  it('clamps to the last valid day when the target month is shorter', () => {
    const from = new Date(Date.UTC(2026, 1, 1)); // Feb 1
    const next = nextMonthlyDayOccurrence(from, 31);
    expect(next.getUTCMonth()).toBe(1); // February
    expect(next.getUTCDate()).toBe(28); // 2026 is not a leap year
  });

  it('rolls to next month once the target day in the current month has passed', () => {
    const from = new Date(Date.UTC(2026, 6, 20)); // July 20
    const next = nextMonthlyDayOccurrence(from, 15);
    expect(next.getUTCMonth()).toBe(7); // August
    expect(next.getUTCDate()).toBe(15);
  });
});
