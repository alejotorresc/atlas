import { differenceInCalendarDays } from 'date-fns';

export type SavingsPaceStatus = 'ahead' | 'on_track' | 'behind';

export interface SavingsPace {
  remainingAmountMinor: number;
  monthsRemaining: number;
  suggestedMonthlyContributionMinor: number;
  status: SavingsPaceStatus;
}

/**
 * Compares the actual saved-per-month pace so far against the pace required
 * to reach the target by the target date. `monthsElapsed` should be >= 0 and
 * excludes the current partial month to avoid overstating early pace.
 */
export function calculateSavingsPace(
  currentAmountMinor: number,
  targetAmountMinor: number,
  targetDate: Date,
  today: Date,
  monthsElapsed: number,
): SavingsPace {
  const remainingAmountMinor = Math.max(targetAmountMinor - currentAmountMinor, 0);
  const daysRemaining = Math.max(differenceInCalendarDays(targetDate, today), 0);
  const monthsRemaining = Math.max(daysRemaining / 30, 1 / 30);
  const suggestedMonthlyContributionMinor = Math.ceil(remainingAmountMinor / monthsRemaining);

  let status: SavingsPaceStatus = 'on_track';
  if (remainingAmountMinor === 0) {
    status = 'ahead';
  } else if (monthsElapsed > 0) {
    const actualMonthlyPace = currentAmountMinor / monthsElapsed;
    if (actualMonthlyPace >= suggestedMonthlyContributionMinor * 1.05) {
      status = 'ahead';
    } else if (actualMonthlyPace < suggestedMonthlyContributionMinor * 0.9) {
      status = 'behind';
    }
  }

  return { remainingAmountMinor, monthsRemaining, suggestedMonthlyContributionMinor, status };
}

/** Progress ratio capped at 1 for display, while the caller keeps the real amount for text. */
export function savingsProgressRatio(currentAmountMinor: number, targetAmountMinor: number): number {
  if (targetAmountMinor <= 0) return 0;
  return Math.min(currentAmountMinor / targetAmountMinor, 1);
}
