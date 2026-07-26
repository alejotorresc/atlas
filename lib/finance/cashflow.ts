import type { Transaction } from '@/types/database';

type ClearedTx = Pick<Transaction, 'transaction_type' | 'amount_minor' | 'status'>;

/** Cleared income minus cleared expenses. Transfers and card payments are excluded. */
export function monthlyCashFlow(transactions: ClearedTx[]): {
  income: number;
  expenses: number;
  netCashFlow: number;
} {
  const cleared = transactions.filter((t) => t.status === 'cleared');
  const income = cleared.filter((t) => t.transaction_type === 'income').reduce((s, t) => s + t.amount_minor, 0);
  const refunds = cleared.filter((t) => t.transaction_type === 'refund').reduce((s, t) => s + t.amount_minor, 0);
  const expenses = cleared.filter((t) => t.transaction_type === 'expense').reduce((s, t) => s + t.amount_minor, 0);
  const netExpenses = expenses - refunds;
  return { income, expenses: netExpenses, netCashFlow: income - netExpenses };
}
