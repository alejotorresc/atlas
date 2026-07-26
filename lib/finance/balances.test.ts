import { describe, expect, it } from 'vitest';
import { netPosition, reservedSavings, totalLiquidBalance } from './balances';

describe('totalLiquidBalance', () => {
  it('sums only active accounts included in available balance', () => {
    const accounts = [
      { current_balance_minor: 1000, include_in_available_balance: true, is_archived: false },
      { current_balance_minor: 500, include_in_available_balance: false, is_archived: false },
      { current_balance_minor: 300, include_in_available_balance: true, is_archived: true },
    ];
    expect(totalLiquidBalance(accounts)).toBe(1000);
  });
});

describe('reservedSavings — double-count prevention', () => {
  it('counts a goal with no linked account', () => {
    const goals = [
      { current_amount_minor: 200, exclude_from_available_balance: true, status: 'active' as const, linked_account_id: null },
    ];
    expect(reservedSavings(goals, new Map())).toBe(200);
  });

  it('skips a goal whose linked account is already excluded from available balance', () => {
    const accountsById = new Map([
      ['acc-1', { current_balance_minor: 200, include_in_available_balance: false, is_archived: false }],
    ]);
    const goals = [
      { current_amount_minor: 200, exclude_from_available_balance: true, status: 'active' as const, linked_account_id: 'acc-1' },
    ];
    // acc-1's balance is already excluded from totalLiquidBalance, so
    // reservedSavings must not subtract it a second time.
    expect(reservedSavings(goals, accountsById)).toBe(0);
  });

  it('still counts a goal whose linked account IS included in available balance', () => {
    const accountsById = new Map([
      ['acc-1', { current_balance_minor: 200, include_in_available_balance: true, is_archived: false }],
    ]);
    const goals = [
      { current_amount_minor: 200, exclude_from_available_balance: true, status: 'active' as const, linked_account_id: 'acc-1' },
    ];
    expect(reservedSavings(goals, accountsById)).toBe(200);
  });

  it('ignores non-active goals', () => {
    const goals = [
      { current_amount_minor: 200, exclude_from_available_balance: true, status: 'paused' as const, linked_account_id: null },
    ];
    expect(reservedSavings(goals, new Map())).toBe(0);
  });
});

describe('netPosition', () => {
  it('subtracts card balances from account balances, ignoring archived rows', () => {
    const accounts = [{ current_balance_minor: 5000, include_in_available_balance: true, is_archived: false }];
    const cards = [
      { current_balance_minor: 1200, is_archived: false },
      { current_balance_minor: 9999, is_archived: true },
    ];
    expect(netPosition(accounts, cards)).toBe(3800);
  });
});
