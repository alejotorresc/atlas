import { createClient } from '@/lib/supabase/server';
import { monthlyCashFlow } from '@/lib/finance/cashflow';
import { creditUtilization } from '@/lib/finance/credit';

export interface MonthSummary {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  savingsContributions: number;
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  amountMinor: number;
}

export interface CardUtilizationRow {
  cardId: string;
  cardName: string;
  currentBalanceMinor: number;
  creditLimitMinor: number;
  utilization: number;
}

function monthsBack(count: number): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export async function getMonthlySummaries(userId: string, count = 6): Promise<MonthSummary[]> {
  const supabase = await createClient();
  const months = monthsBack(count);
  const rangeStart = `${months[0]}-01`;
  const lastMonth = months[months.length - 1]!;
  const [y, m] = lastMonth.split('-').map(Number);
  const rangeEnd = new Date(Date.UTC(y!, m!, 1)).toISOString().slice(0, 10);

  const { data } = await supabase
    .from('transactions')
    .select('transaction_type, amount_minor, status, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', rangeStart)
    .lt('transaction_date', rangeEnd);

  const rows = data ?? [];

  return months.map((month) => {
    const monthRows = rows.filter((r) => r.transaction_date.startsWith(month));
    const { income, expenses, netCashFlow } = monthlyCashFlow(monthRows);
    const savingsContributions = monthRows
      .filter((r) => r.transaction_type === 'savings_contribution' && r.status === 'cleared')
      .reduce((s, r) => s + r.amount_minor, 0);
    return { month, income, expenses, netCashFlow, savingsContributions };
  });
}

export async function getExpenseDistribution(userId: string, month: string): Promise<CategoryExpense[]> {
  const supabase = await createClient();
  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end = new Date(Date.UTC(y!, m!, 1)).toISOString().slice(0, 10);

  const { data } = await supabase
    .from('transactions')
    .select('category_id, amount_minor')
    .eq('user_id', userId)
    .eq('transaction_type', 'expense')
    .eq('status', 'cleared')
    .gte('transaction_date', start)
    .lt('transaction_date', end)
    .not('category_id', 'is', null);

  const { data: categories } = await supabase.from('categories').select('id, name').eq('user_id', userId);
  const categoriesById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;
    totals.set(row.category_id, (totals.get(row.category_id) ?? 0) + row.amount_minor);
  }

  return Array.from(totals.entries())
    .map(([categoryId, amountMinor]) => ({ categoryId, categoryName: categoriesById.get(categoryId) ?? 'Sin categoria', amountMinor }))
    .sort((a, b) => b.amountMinor - a.amountMinor);
}

export async function getCardUtilizationReport(userId: string): Promise<CardUtilizationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('credit_cards').select('*').eq('user_id', userId).eq('is_archived', false);

  return (data ?? []).map((card) => ({
    cardId: card.id,
    cardName: card.name,
    currentBalanceMinor: card.current_balance_minor,
    creditLimitMinor: card.credit_limit_minor,
    utilization: creditUtilization(card.current_balance_minor, card.credit_limit_minor),
  }));
}
