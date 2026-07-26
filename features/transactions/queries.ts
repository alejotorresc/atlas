import { createClient } from '@/lib/supabase/server';
import type { Transaction, TransactionStatus, TransactionType } from '@/types/database';

export interface TransactionFilters {
  month?: string; // YYYY-MM
  from?: string;
  to?: string;
  type?: TransactionType;
  accountId?: string;
  creditCardId?: string;
  categoryId?: string;
  status?: TransactionStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface TransactionsPage {
  transactions: Transaction[];
  total: number;
  totalIncome: number;
  totalExpense: number;
}

export async function listTransactions(userId: string, filters: TransactionFilters): Promise<TransactionsPage> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  let query = supabase.from('transactions').select('*', { count: 'exact' }).eq('user_id', userId);

  if (filters.month) {
    const start = `${filters.month}-01`;
    const [y, m] = filters.month.split('-').map(Number);
    const end = new Date(Date.UTC(y!, m!, 1)).toISOString().slice(0, 10);
    query = query.gte('transaction_date', start).lt('transaction_date', end);
  } else if (filters.from && filters.to) {
    query = query.gte('transaction_date', filters.from).lte('transaction_date', filters.to);
  }
  if (filters.type) query = query.eq('transaction_type', filters.type);
  if (filters.accountId) query = query.or(`account_id.eq.${filters.accountId},destination_account_id.eq.${filters.accountId}`);
  if (filters.creditCardId) query = query.eq('credit_card_id', filters.creditCardId);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) query = query.or(`description.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%`);

  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  const { data, count } = await query.order('transaction_date', { ascending: false }).range(rangeFrom, rangeTo);
  const transactions = data ?? [];

  const totalIncome = transactions.filter((t) => t.transaction_type === 'income' && t.status === 'cleared').reduce((s, t) => s + t.amount_minor, 0);
  const totalExpense = transactions.filter((t) => t.transaction_type === 'expense' && t.status === 'cleared').reduce((s, t) => s + t.amount_minor, 0);

  return { transactions, total: count ?? 0, totalIncome, totalExpense };
}

export async function listRecentTransactions(userId: string, limit = 8): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('transaction_date', { ascending: false })
    .limit(limit);
  return data ?? [];
}
