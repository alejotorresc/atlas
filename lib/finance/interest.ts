import type { InterestCalcMethod } from '@/types/database';

const MAX_PAYOFF_MONTHS = 600;
const MIN_MINIMUM_PAYMENT_MINOR = 10_000; // Q100.00

type InterestCard = {
  current_balance_minor: number;
  statement_balance_minor: number;
  interest_calculation_method: InterestCalcMethod;
};

type MinimumPaymentCard = {
  current_balance_minor: number;
  minimum_payment_minor: number | null;
  minimum_payment_percentage: number | null;
};

/**
 * Balance interest is estimated against. `statement_balance` uses the last
 * closed statement (exact, from stored data). `average_daily_balance` is an
 * approximation — ATLAS doesn't keep a daily balance ledger, so it averages
 * the statement and current balances as a stand-in for the true ADB.
 */
export function estimateBalanceForInterest(card: InterestCard): number {
  if (card.interest_calculation_method === 'average_daily_balance') {
    return Math.round((card.statement_balance_minor + card.current_balance_minor) / 2);
  }
  return card.statement_balance_minor;
}

/** One billing cycle's interest at a simple monthly rate (APR / 12). */
export function estimateCycleInterest(balanceMinor: number, aprPercent: number): number {
  if (balanceMinor <= 0 || aprPercent <= 0) return 0;
  return Math.round(balanceMinor * (aprPercent / 100 / 12));
}

/** Paying this amount by the due date avoids interest on the current statement. */
export function paymentToAvoidInterest(card: Pick<InterestCard, 'statement_balance_minor'>): number {
  return Math.max(card.statement_balance_minor, 0);
}

/**
 * Fixed override if set, else a percentage-of-balance formula, else a
 * Q100 floor (typical bank minimum) — never zero for a card carrying debt.
 */
export function computeMinimumPayment(card: MinimumPaymentCard): number {
  if (card.current_balance_minor <= 0) return 0;
  if (card.minimum_payment_minor != null) return card.minimum_payment_minor;
  if (card.minimum_payment_percentage != null) {
    return Math.max(Math.round(card.current_balance_minor * card.minimum_payment_percentage), MIN_MINIMUM_PAYMENT_MINOR);
  }
  return Math.min(MIN_MINIMUM_PAYMENT_MINOR, card.current_balance_minor);
}

export interface PayoffMonth {
  month: number;
  interestMinor: number;
  principalMinor: number;
  balanceMinor: number;
}

export interface PayoffResult {
  months: number;
  totalInterestMinor: number;
  totalPaidMinor: number;
  schedule: PayoffMonth[];
  neverPaysOff: boolean;
}

/**
 * Month-by-month amortization: each cycle accrues interest at APR/12 on the
 * remaining balance, then applies the payment (interest first, remainder to
 * principal). Stops when the balance reaches zero, or flags `neverPaysOff`
 * if the payment never exceeds accruing interest (would loop forever).
 */
export function simulatePayoff({
  balanceMinor,
  aprPercent,
  monthlyPaymentMinor,
}: {
  balanceMinor: number;
  aprPercent: number;
  monthlyPaymentMinor: number;
}): PayoffResult {
  if (balanceMinor <= 0) {
    return { months: 0, totalInterestMinor: 0, totalPaidMinor: 0, schedule: [], neverPaysOff: false };
  }

  const monthlyRate = aprPercent / 100 / 12;
  const firstCycleInterest = Math.round(balanceMinor * monthlyRate);
  if (monthlyPaymentMinor <= firstCycleInterest) {
    return { months: MAX_PAYOFF_MONTHS, totalInterestMinor: 0, totalPaidMinor: 0, schedule: [], neverPaysOff: true };
  }

  let balance = balanceMinor;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: PayoffMonth[] = [];

  for (let month = 1; month <= MAX_PAYOFF_MONTHS && balance > 0; month++) {
    const interest = Math.round(balance * monthlyRate);
    const payment = Math.min(monthlyPaymentMinor, balance + interest);
    const principal = payment - interest;

    balance = balance + interest - payment;
    totalInterest += interest;
    totalPaid += payment;
    schedule.push({ month, interestMinor: interest, principalMinor: principal, balanceMinor: Math.max(balance, 0) });
  }

  return { months: schedule.length, totalInterestMinor: totalInterest, totalPaidMinor: totalPaid, schedule, neverPaysOff: balance > 0 };
}

/** How a single payment splits between this cycle's interest and principal. */
export function splitPayment(
  paymentMinor: number,
  card: InterestCard,
  aprPercent: number,
): { interestPortionMinor: number; principalPortionMinor: number } {
  const cycleInterest = estimateCycleInterest(estimateBalanceForInterest(card), aprPercent);
  const interestPortionMinor = Math.min(cycleInterest, paymentMinor);
  return { interestPortionMinor, principalPortionMinor: paymentMinor - interestPortionMinor };
}
