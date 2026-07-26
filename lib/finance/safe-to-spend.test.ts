import { describe, expect, it } from 'vitest';
import { calculateSafeToSpend } from './safe-to-spend';

describe('calculateSafeToSpend', () => {
  it('returns the full breakdown alongside the total', () => {
    const result = calculateSafeToSpend({
      liquidBalanceMinor: 10000,
      reservedSavingsMinor: 2000,
      unpaidObligationsDueMinor: 3000,
      pendingAccountExpensesMinor: 500,
      expectedIncomeMinor: 4000,
    });

    expect(result.safeToSpendMinor).toBe(10000 - 2000 - 3000 - 500 + 4000);
    expect(result.liquidBalanceMinor).toBe(10000);
    expect(result.expectedIncomeMinor).toBe(4000);
  });

  it('can go negative when obligations exceed available funds', () => {
    const result = calculateSafeToSpend({
      liquidBalanceMinor: 1000,
      reservedSavingsMinor: 0,
      unpaidObligationsDueMinor: 5000,
      pendingAccountExpensesMinor: 0,
      expectedIncomeMinor: 0,
    });
    expect(result.safeToSpendMinor).toBeLessThan(0);
  });
});
