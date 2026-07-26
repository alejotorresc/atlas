import type { Account, CreditCard, SavingsGoal } from '@/types/database';

type ActiveAccount = Pick<Account, 'current_balance_minor' | 'include_in_available_balance' | 'is_archived'>;
type ActiveCard = Pick<CreditCard, 'current_balance_minor' | 'is_archived'>;
type ActiveGoal = Pick<
  SavingsGoal,
  'current_amount_minor' | 'exclude_from_available_balance' | 'status' | 'linked_account_id'
>;

/** Sum current balances of active accounts included in available balance. */
export function totalLiquidBalance(accounts: ActiveAccount[]): number {
  return accounts
    .filter((a) => !a.is_archived && a.include_in_available_balance)
    .reduce((sum, a) => sum + a.current_balance_minor, 0);
}

/**
 * Sum active savings goal amounts excluded from available balance, skipping
 * goals whose linked account is itself already excluded from available
 * balance (to avoid subtracting the same money twice).
 */
export function reservedSavings(
  goals: ActiveGoal[],
  accountsById: Map<string, ActiveAccount>,
): number {
  return goals
    .filter((g) => g.status === 'active' && g.exclude_from_available_balance)
    .filter((g) => {
      if (!g.linked_account_id) return true;
      const linked = accountsById.get(g.linked_account_id);
      // If the linked account is already excluded from available balance,
      // its funds are not counted in totalLiquidBalance, so subtracting the
      // goal amount again here would double-count the reservation.
      return linked ? linked.include_in_available_balance : true;
    })
    .reduce((sum, g) => sum + g.current_amount_minor, 0);
}

/** Net position: eligible account balances minus credit-card current balances. */
export function netPosition(accounts: ActiveAccount[], cards: ActiveCard[]): number {
  const accountsTotal = accounts.filter((a) => !a.is_archived).reduce((s, a) => s + a.current_balance_minor, 0);
  const cardsTotal = cards.filter((c) => !c.is_archived).reduce((s, c) => s + c.current_balance_minor, 0);
  return accountsTotal - cardsTotal;
}

export function totalCreditCardDebt(cards: ActiveCard[]): number {
  return cards.filter((c) => !c.is_archived).reduce((s, c) => s + c.current_balance_minor, 0);
}
