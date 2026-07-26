import { createClient } from '@/lib/supabase/server';
import type { Budget } from '@/types/database';

export async function listBudgets(userId: string, month: string): Promise<Budget[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('budgets').select('*').eq('user_id', userId).eq('month', month).order('created_at');
  return data ?? [];
}

export async function getCategorySpend(userId: string, month: string): Promise<Map<string, number>> {
  const supabase = await createClient();
  const monthStart = month;
  const [y, m] = month.split('-').map(Number);
  const monthEnd = new Date(Date.UTC(y!, m!, 1)).toISOString().slice(0, 10);

  const { data } = await supabase
    .from('transactions')
    .select('category_id, amount_minor')
    .eq('user_id', userId)
    .eq('transaction_type', 'expense')
    .eq('status', 'cleared')
    .gte('transaction_date', monthStart)
    .lt('transaction_date', monthEnd)
    .not('category_id', 'is', null);

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;
    map.set(row.category_id, (map.get(row.category_id) ?? 0) + row.amount_minor);
  }
  return map;
}
