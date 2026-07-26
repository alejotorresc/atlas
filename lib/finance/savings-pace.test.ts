import { describe, expect, it } from 'vitest';
import { calculateSavingsPace, savingsProgressRatio } from './savings-pace';

describe('calculateSavingsPace', () => {
  it('marks a goal ahead once the target amount is reached', () => {
    const result = calculateSavingsPace(10000, 10000, new Date('2027-01-01'), new Date('2026-01-01'), 6);
    expect(result.status).toBe('ahead');
    expect(result.remainingAmountMinor).toBe(0);
  });

  it('marks behind when actual pace is well under the required pace', () => {
    // Needs 10000 over ~12 months (~833/mo) but has only saved 500 total after 6 months (~83/mo).
    const result = calculateSavingsPace(500, 10000, new Date('2027-01-01'), new Date('2026-07-01'), 6);
    expect(result.status).toBe('behind');
  });

  it('marks on_track when pace roughly matches what is required', () => {
    const result = calculateSavingsPace(5000, 10000, new Date('2027-01-01'), new Date('2026-07-01'), 6);
    expect(result.status).toBe('on_track');
  });
});

describe('savingsProgressRatio', () => {
  it('caps display ratio at 1 even when overfunded', () => {
    expect(savingsProgressRatio(15000, 10000)).toBe(1);
  });

  it('handles a zero target safely', () => {
    expect(savingsProgressRatio(100, 0)).toBe(0);
  });
});
