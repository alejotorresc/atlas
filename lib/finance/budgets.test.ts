import { describe, expect, it } from 'vitest';
import { projectBudget } from './budgets';

describe('projectBudget', () => {
  it('is healthy under 80%', () => {
    const result = projectBudget(10000, 3000, 15, 30);
    expect(result.status).toBe('healthy');
    expect(result.percentageUsed).toBe(30);
  });

  it('warns at 80% or above', () => {
    const result = projectBudget(10000, 8000, 15, 30);
    expect(result.status).toBe('warning');
  });

  it('flags exceeded above 100%', () => {
    const result = projectBudget(10000, 10500, 20, 30);
    expect(result.status).toBe('exceeded');
  });

  it('handles the first day of the month without dividing by zero', () => {
    const result = projectBudget(10000, 500, 1, 31);
    expect(result.projectedEndOfMonthMinor).toBe(500 * 31);
    expect(Number.isFinite(result.projectedEndOfMonthMinor)).toBe(true);
  });

  it('handles the last day of the month as the actual spend', () => {
    const result = projectBudget(10000, 9000, 30, 30);
    expect(result.projectedEndOfMonthMinor).toBe(9000);
  });
});
