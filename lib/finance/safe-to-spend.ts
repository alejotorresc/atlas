export interface SafeToSpendInputs {
  liquidBalanceMinor: number;
  reservedSavingsMinor: number;
  unpaidObligationsDueMinor: number;
  pendingAccountExpensesMinor: number;
  expectedIncomeMinor: number;
}

export interface SafeToSpendBreakdown extends SafeToSpendInputs {
  safeToSpendMinor: number;
}

/**
 * MVP safe-to-spend estimate. This is a rough planning aid, not financial
 * advice — always surface `breakdown` alongside the total so the user can
 * see how it was derived.
 *
 * safe_to_spend =
 *   liquid_balance
 *   - reserved_savings_not_already_excluded
 *   - unpaid_obligations_due_before_next_expected_income
 *   - pending_account_expenses
 *   + expected_income_before_the_end_of_the_selected_horizon
 */
export function calculateSafeToSpend(inputs: SafeToSpendInputs): SafeToSpendBreakdown {
  const safeToSpendMinor =
    inputs.liquidBalanceMinor -
    inputs.reservedSavingsMinor -
    inputs.unpaidObligationsDueMinor -
    inputs.pendingAccountExpensesMinor +
    inputs.expectedIncomeMinor;

  return { ...inputs, safeToSpendMinor };
}
