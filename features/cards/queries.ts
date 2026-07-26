import { createClient } from '@/lib/supabase/server';
import type { CreditCard, Transaction } from '@/types/database';

export async function listCards(userId: string): Promise<CreditCard[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId)
    .order('is_archived', { ascending: true })
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function getCard(userId: string, id: string): Promise<CreditCard | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('credit_cards').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  return data;
}

export async function listCardTransactions(userId: string, cardId: string, limit = 20): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('credit_card_id', cardId)
    .order('transaction_date', { ascending: false })
    .limit(limit);
  return data ?? [];
}
