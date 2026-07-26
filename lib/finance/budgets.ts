export type BudgetStatus = 'healthy' | 'warning' | 'exceeded';

export interface BudgetProjection {
  spentMinor: number;
  remainingMinor: number;
  percentageUsed: number;
  projectedEndOfMonthMinor: number;
  status: BudgetStatus;
}

/**
 * Simple linear projection based on elapsed days in the month.
 * dayOfMonth and totalDaysInMonth are both 1-based; on the first day the
 * projection equals spent-so-far scaled by the full month to avoid dividing
 * by zero, and on the last day it equals the actual spend.
 */
export function projectBudget(
  budgetAmountMinor: number,
  spentMinor: number,
  dayOfMonth: number,
  totalDaysInMonth: number,
): BudgetProjection {
  const safeDayOfMonth = Math.min(Math.max(dayOfMonth, 1), totalDaysInMonth);
  const projectedEndOfMonthMinor = Math.round((spentMinor / safeDayOfMonth) * totalDaysInMonth);
  const percentageUsed = budgetAmountMinor > 0 ? (spentMinor / budgetAmountMinor) * 100 : 0;

  let status: BudgetStatus = 'healthy';
  if (percentageUsed > 100) status = 'exceeded';
  else if (percentageUsed >= 80) status = 'warning';

  return {
    spentMinor,
    remainingMinor: budgetAmountMinor - spentMinor,
    percentageUsed,
    projectedEndOfMonthMinor,
    status,
  };
}
