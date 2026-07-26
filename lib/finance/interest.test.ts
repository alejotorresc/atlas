import { describe, expect, it } from 'vitest';
import {
  computeMinimumPayment,
  estimateBalanceForInterest,
  estimateCycleInterest,
  paymentToAvoidInterest,
  simulatePayoff,
  splitPayment,
} from './interest';

describe('estimateBalanceForInterest', () => {
  it('uses the statement balance for the statement_balance method', () => {
    expect(
      estimateBalanceForInterest({
        current_balance_minor: 20000,
        statement_balance_minor: 15000,
        interest_calculation_method: 'statement_balance',
      }),
    ).toBe(15000);
  });

  it('averages statement and current balance for average_daily_balance', () => {
    expect(
      estimateBalanceForInterest({
        current_balance_minor: 20000,
        statement_balance_minor: 10000,
        interest_calculation_method: 'average_daily_balance',
      }),
    ).toBe(15000);
  });
});

describe('estimateCycleInterest', () => {
  it('applies APR/12 to the balance', () => {
    // Q10,000 at 24% APR -> monthly rate 2% -> Q200.00
    expect(estimateCycleInterest(1_000_000, 24)).toBe(20_000);
  });

  it('returns 0 for a zero or negative balance', () => {
    expect(estimateCycleInterest(0, 24)).toBe(0);
    expect(estimateCycleInterest(-500, 24)).toBe(0);
  });
});

describe('paymentToAvoidInterest', () => {
  it('equals the statement balance', () => {
    expect(paymentToAvoidInterest({ statement_balance_minor: 12345 })).toBe(12345);
  });
});

describe('computeMinimumPayment', () => {
  it('returns 0 when there is no balance', () => {
    expect(computeMinimumPayment({ current_balance_minor: 0, minimum_payment_minor: null, minimum_payment_percentage: null })).toBe(0);
  });

  it('prefers a fixed override', () => {
    expect(
      computeMinimumPayment({ current_balance_minor: 500_000, minimum_payment_minor: 25_000, minimum_payment_percentage: 0.1 }),
    ).toBe(25_000);
  });

  it('falls back to a percentage of the balance, floored at Q100', () => {
    expect(
      computeMinimumPayment({ current_balance_minor: 1_000_000, minimum_payment_minor: null, minimum_payment_percentage: 0.02 }),
    ).toBe(20_000);
    expect(
      computeMinimumPayment({ current_balance_minor: 100_000, minimum_payment_minor: null, minimum_payment_percentage: 0.02 }),
    ).toBe(10_000);
  });

  it('floors at Q100 (or the balance, if smaller) with no formula configured', () => {
    expect(computeMinimumPayment({ current_balance_minor: 500_000, minimum_payment_minor: null, minimum_payment_percentage: null })).toBe(10_000);
    expect(computeMinimumPayment({ current_balance_minor: 5_000, minimum_payment_minor: null, minimum_payment_percentage: null })).toBe(5_000);
  });
});

describe('simulatePayoff', () => {
  it('returns an immediate payoff for a zero balance', () => {
    const result = simulatePayoff({ balanceMinor: 0, aprPercent: 24, monthlyPaymentMinor: 100_000 });
    expect(result).toEqual({ months: 0, totalInterestMinor: 0, totalPaidMinor: 0, schedule: [], neverPaysOff: false });
  });

  it('flags neverPaysOff when the payment does not exceed accruing interest', () => {
    // Q10,000 at 24% APR accrues ~Q200/month; a Q150 payment can never catch up.
    const result = simulatePayoff({ balanceMinor: 1_000_000, aprPercent: 24, monthlyPaymentMinor: 15_000 });
    expect(result.neverPaysOff).toBe(true);
  });

  it('amortizes a balance to zero and tracks total interest/paid', () => {
    const result = simulatePayoff({ balanceMinor: 1_000_000, aprPercent: 24, monthlyPaymentMinor: 100_000 });
    expect(result.neverPaysOff).toBe(false);
    expect(result.months).toBeGreaterThan(0);
    expect(result.schedule.at(-1)?.balanceMinor).toBe(0);
    expect(result.totalPaidMinor).toBe(1_000_000 + result.totalInterestMinor);
    // Paying more should never take longer or cost more in interest.
    const faster = simulatePayoff({ balanceMinor: 1_000_000, aprPercent: 24, monthlyPaymentMinor: 200_000 });
    expect(faster.months).toBeLessThan(result.months);
    expect(faster.totalInterestMinor).toBeLessThan(result.totalInterestMinor);
  });
});

describe('splitPayment', () => {
  it('applies the payment to interest first, then principal', () => {
    const card = {
      current_balance_minor: 1_000_000,
      statement_balance_minor: 1_000_000,
      interest_calculation_method: 'statement_balance' as const,
    };
    // Cycle interest at 24% APR on Q10,000 is Q200.00 (20,000 minor units).
    const result = splitPayment(50_000, card, 24);
    expect(result.interestPortionMinor).toBe(20_000);
    expect(result.principalPortionMinor).toBe(30_000);
  });

  it('caps the interest portion at the payment amount for small payments', () => {
    const card = {
      current_balance_minor: 1_000_000,
      statement_balance_minor: 1_000_000,
      interest_calculation_method: 'statement_balance' as const,
    };
    const result = splitPayment(5_000, card, 24);
    expect(result.interestPortionMinor).toBe(5_000);
    expect(result.principalPortionMinor).toBe(0);
  });
});
