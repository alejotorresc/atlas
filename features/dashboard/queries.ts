import { createClient } from '@/lib/supabase/server';
import { totalLiquidBalance, reservedSavings, netPosition, totalCreditCardDebt } from '@/lib/finance/balances';
import { calculateSafeToSpend, type SafeToSpendBreakdown } from '@/lib/finance/safe-to-spend';
import { monthlyCashFlow } from '@/lib/finance/cashflow';
import { projectBudget } from '@/lib/finance/budgets';
import { addDaysUtc } from '@/lib/finance/dates';
import { getProfile } from '@/features/profile/queries';
import type { Account, Alert, Budget, SavingsGoal, Transaction } from '@/types/database';

export interface NextCommitment {
  name: string;
  dueDate: string;
  amountMinor: number;
  daysUntil: number;
}

export async function computeSafeToSpend(userId: string): Promise<SafeToSpendBreakdown> {
  const supabase = await createClient();
  const profile = await getProfile();
  const horizonDays = profile?.default_obligation_horizon_days ?? 15;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const horizonEnd = addDaysUtc(today, horizonDays).toISOString().slice(0, 10);

  const [{ data: accounts }, { data: goals }, { data: unpaidOccurrences }, { data: pendingExpenses }, { data: pendingIncome }] =
    await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', userId).eq('is_archived', false),
      supabase.from('savings_goals').select('*').eq('user_id', userId).eq('status', 'active'),
      supabase
        .from('obligation_occurrences')
        .select('expected_amount_minor')
        .eq('user_id', userId)
        .lte('due_date', horizonEnd)
        .in('status', ['upcoming', 'pending', 'overdue', 'partial']),
      supabase
        .from('transactions')
        .select('amount_minor')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense')
        .eq('status', 'pending'),
      supabase
        .from('transactions')
        .select('amount_minor')
        .eq('user_id', userId)
        .eq('transaction_type', 'income')
        .eq('status', 'pending')
        .gte('transaction_date', todayStr)
        .lte('transaction_date', horizonEnd),
    ]);

  const accountsList = accounts ?? [];
  const accountsById = new Map(accountsList.map((a) => [a.id, a]));

  const liquidBalanceMinor = totalLiquidBalance(accountsList);
  const reservedSavingsMinor = reservedSavings(goals ?? [], accountsById);
  const unpaidObligationsDueMinor = (unpaidOccurrences ?? []).reduce((s, o) => s + o.expected_amount_minor, 0);
  const pendingAccountExpensesMinor = (pendingExpenses ?? []).reduce((s, t) => s + t.amount_minor, 0);
  const expectedIncomeMinor = (pendingIncome ?? []).reduce((s, t) => s + t.amount_minor, 0);

  return calculateSafeToSpend({
    liquidBalanceMinor,
    reservedSavingsMinor,
    unpaidObligationsDueMinor,
    pendingAccountExpensesMinor,
    expectedIncomeMinor,
  });
}

export interface DashboardData {
  safeToSpend: SafeToSpendBreakdown;
  liquidBalance: number;
  creditCardDebt: number;
  netPosition: number;
  monthIncome: number;
  monthExpenses: number;
  monthNetCashFlow: number;
  upcoming7: number;
  upcoming15: number;
  upcoming30: number;
  nextExpectedIncome: Transaction | null;
  nextCommitment: NextCommitment | null;
  recentTransactions: Transaction[];
  activeAlerts: Alert[];
  budgetsCloseToLimit: Array<{ budget: Budget; categoryName: string; percentageUsed: number; spentMinor: number }>;
  savingsGoals: SavingsGoal[];
  accounts: Account[];
  hasAnyAccount: boolean;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const today = new Date();
  const monthStart = today.toISOString().slice(0, 7) + '-01';
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);

  const [
    accountsRes,
    cardsRes,
    monthTxRes,
    occ7Res,
    occ15Res,
    occ30Res,
    nextIncomeRes,
    nextCommitmentRes,
    recentTxRes,
    alertsRes,
    budgetsRes,
    categoriesRes,
    goalsRes,
  ] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', userId).eq('is_archived', false),
      supabase.from('credit_cards').select('*').eq('user_id', userId).eq('is_archived', false),
      supabase
        .from('transactions')
        .select('transaction_type, amount_minor, status')
        .eq('user_id', userId)
        .gte('transaction_date', monthStart)
        .lt('transaction_date', monthEnd),
      supabase
        .from('obligation_occurrences')
        .select('expected_amount_minor')
        .eq('user_id', userId)
        .lte('due_date', addDaysUtc(today, 7).toISOString().slice(0, 10))
        .in('status', ['upcoming', 'pending', 'overdue', 'partial']),
      supabase
        .from('obligation_occurrences')
        .select('expected_amount_minor')
        .eq('user_id', userId)
        .lte('due_date', addDaysUtc(today, 15).toISOString().slice(0, 10))
        .in('status', ['upcoming', 'pending', 'overdue', 'partial']),
      supabase
        .from('obligation_occurrences')
        .select('expected_amount_minor')
        .eq('user_id', userId)
        .lte('due_date', addDaysUtc(today, 30).toISOString().slice(0, 10))
        .in('status', ['upcoming', 'pending', 'overdue', 'partial']),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'income')
        .eq('status', 'pending')
        .gte('transaction_date', todayStr)
        .order('transaction_date')
        .limit(1)
        .maybeSingle(),
      supabase
        .from('obligation_occurrences')
        .select('due_date, expected_amount_minor, recurring_obligations(name)')
        .eq('user_id', userId)
        .gte('due_date', todayStr)
        .in('status', ['upcoming', 'pending', 'overdue', 'partial'])
        .order('due_date')
        .limit(1)
        .maybeSingle(),
      supabase.from('transactions').select('*').eq('user_id', userId).neq('status', 'cancelled').order('transaction_date', { ascending: false }).limit(8),
      supabase.from('alerts').select('*').eq('user_id', userId).is('dismissed_at', null).order('effective_date', { ascending: false }).limit(5),
      supabase.from('budgets').select('*').eq('user_id', userId).eq('month', monthStart),
      supabase.from('categories').select('id, name').eq('user_id', userId),
      supabase.from('savings_goals').select('*').eq('user_id', userId).eq('status', 'active'),
    ]);

  const accountsList = accountsRes.data ?? [];
  const cardsList = cardsRes.data ?? [];
  const { income: monthIncome, expenses: monthExpenses, netCashFlow: monthNetCashFlow } = monthlyCashFlow(monthTxRes.data ?? []);

  const categoriesById = new Map((categoriesRes.data ?? []).map((c) => [c.id, c.name]));
  const dayOfMonth = today.getUTCDate();
  const totalDaysInMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate();

  const budgetsWithSpend = await Promise.all(
    (budgetsRes.data ?? []).map(async (budget: Budget) => {
      const { data: spendRows } = await supabase
        .from('transactions')
        .select('amount_minor')
        .eq('user_id', userId)
        .eq('category_id', budget.category_id)
        .eq('transaction_type', 'expense')
        .eq('status', 'cleared')
        .gte('transaction_date', monthStart)
        .lte('transaction_date', todayStr);
      const spent = (spendRows ?? []).reduce((s, r) => s + r.amount_minor, 0);
      const { percentageUsed } = projectBudget(budget.budget_amount_minor, spent, dayOfMonth, totalDaysInMonth);
      return { budget, categoryName: categoriesById.get(budget.category_id) ?? 'Categoria', percentageUsed, spentMinor: spent };
    }),
  );
  const budgetsCloseToLimit = budgetsWithSpend.sort((a, b) => b.percentageUsed - a.percentageUsed).slice(0, 5);

  const safeToSpend = await computeSafeToSpend(userId);

  const commitmentRow = nextCommitmentRes.data as
    | { due_date: string; expected_amount_minor: number; recurring_obligations: { name: string } | { name: string }[] | null }
    | null;
  const nextCommitment: NextCommitment | null = commitmentRow
    ? {
        name: Array.isArray(commitmentRow.recurring_obligations)
          ? (commitmentRow.recurring_obligations[0]?.name ?? 'Compromiso')
          : (commitmentRow.recurring_obligations?.name ?? 'Compromiso'),
        dueDate: commitmentRow.due_date,
        amountMinor: commitmentRow.expected_amount_minor,
        daysUntil: Math.max(0, Math.round((new Date(commitmentRow.due_date).getTime() - today.getTime()) / 86_400_000)),
      }
    : null;

  return {
    safeToSpend,
    liquidBalance: totalLiquidBalance(accountsList),
    creditCardDebt: totalCreditCardDebt(cardsList),
    netPosition: netPosition(accountsList, cardsList),
    monthIncome,
    monthExpenses,
    monthNetCashFlow,
    upcoming7: (occ7Res.data ?? []).reduce((s: number, o: { expected_amount_minor: number }) => s + o.expected_amount_minor, 0),
    upcoming15: (occ15Res.data ?? []).reduce((s: number, o: { expected_amount_minor: number }) => s + o.expected_amount_minor, 0),
    upcoming30: (occ30Res.data ?? []).reduce((s: number, o: { expected_amount_minor: number }) => s + o.expected_amount_minor, 0),
    nextExpectedIncome: nextIncomeRes.data ?? null,
    nextCommitment,
    recentTransactions: recentTxRes.data ?? [],
    activeAlerts: alertsRes.data ?? [],
    budgetsCloseToLimit,
    savingsGoals: goalsRes.data ?? [],
    accounts: accountsList,
    hasAnyAccount: accountsList.length > 0,
  };
}
