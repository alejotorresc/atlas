import { createClient } from '@/lib/supabase/server';
import type { Account, Transaction } from '@/types/database';

export async function listAccounts(userId: string): Promise<Account[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('is_archived', { ascending: true })
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function getAccount(userId: string, id: string): Promise<Account | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('accounts').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  return data;
}

export async function listAccountTransactions(userId: string, accountId: string, limit = 20): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .or(`account_id.eq.${accountId},destination_account_id.eq.${accountId}`)
    .order('transaction_date', { ascending: false })
    .limit(limit);
  return data ?? [];
}
