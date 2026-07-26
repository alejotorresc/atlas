import { describe, expect, it } from 'vitest';
import { generateOccurrences, isOverdue } from './recurrence';

describe('generateOccurrences', () => {
  const base = {
    id: 'obl-1',
    next_due_date: '2026-01-05',
    end_date: null,
    frequency: 'monthly' as const,
    amount_minor: 10000,
    is_active: true,
  };

  it('generates occurrences up to the horizon inclusive', () => {
    const horizon = new Date('2026-03-05T00:00:00.000Z');
    const occurrences = generateOccurrences(base, horizon, new Set());
    expect(occurrences.map((o) => o.due_date)).toEqual(['2026-01-05', '2026-02-05', '2026-03-05']);
  });

  it('does not duplicate already-generated due dates', () => {
    const horizon = new Date('2026-03-05T00:00:00.000Z');
    const occurrences = generateOccurrences(base, horizon, new Set(['2026-01-05']));
    expect(occurrences.map((o) => o.due_date)).toEqual(['2026-02-05', '2026-03-05']);
  });

  it('respects end_date', () => {
    const horizon = new Date('2026-06-05T00:00:00.000Z');
    const occurrences = generateOccurrences({ ...base, end_date: '2026-02-05' }, horizon, new Set());
    expect(occurrences.map((o) => o.due_date)).toEqual(['2026-01-05', '2026-02-05']);
  });

  it('returns nothing for a paused (inactive) obligation', () => {
    const horizon = new Date('2026-06-05T00:00:00.000Z');
    const occurrences = generateOccurrences({ ...base, is_active: false }, horizon, new Set());
    expect(occurrences).toEqual([]);
  });

  it('uses the last valid day of shorter months for monthly frequency starting on the 31st', () => {
    const horizon = new Date('2026-04-30T00:00:00.000Z');
    const occurrences = generateOccurrences({ ...base, next_due_date: '2026-01-31' }, horizon, new Set());
    // date-fns addMonths clamps overflowed days to the last day of the target month.
    expect(occurrences.map((o) => o.due_date)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });
});

describe('isOverdue', () => {
  it('flags a due date strictly before the reference date', () => {
    expect(isOverdue('2026-01-01', new Date('2026-01-02T00:00:00.000Z'))).toBe(true);
  });

  it('does not flag a due date on or after the reference date', () => {
    expect(isOverdue('2026-01-05', new Date('2026-01-02T00:00:00.000Z'))).toBe(false);
  });
});
