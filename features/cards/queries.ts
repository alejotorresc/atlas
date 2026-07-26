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

export interface CardDebtContext {
  hasActiveInstallmentPlan: boolean;
  lastPaymentMinor: number | null;
  lastPaymentDate: string | null;
}

/** Extra data needed to classify a card's automatic debt status. */
export async function getCardDebtContext(userId: string, cardId: string): Promise<CardDebtContext> {
  const contexts = await listCardsDebtContext(userId, [cardId]);
  return contexts.get(cardId) ?? { hasActiveInstallmentPlan: false, lastPaymentMinor: null, lastPaymentDate: null };
}

/** Batched debt context for multiple cards at once (used by the debt overview page). */
export async function listCardsDebtContext(userId: string, cardIds: string[]): Promise<Map<string, CardDebtContext>> {
  const contexts = new Map<string, CardDebtContext>(
    cardIds.map((id) => [id, { hasActiveInstallmentPlan: false, lastPaymentMinor: null, lastPaymentDate: null }]),
  );
  if (cardIds.length === 0) return contexts;

  const supabase = await createClient();
  const [{ data: plans }, { data: payments }] = await Promise.all([
    supabase.from('installment_plans').select('credit_card_id').eq('user_id', userId).eq('status', 'active').in('credit_card_id', cardIds),
    supabase
      .from('transactions')
      .select('credit_card_id, amount_minor, transaction_date')
      .eq('user_id', userId)
      .eq('transaction_type', 'credit_card_payment')
      .eq('status', 'cleared')
      .in('credit_card_id', cardIds)
      .order('transaction_date', { ascending: false }),
  ]);

  for (const plan of plans ?? []) {
    const ctx = contexts.get(plan.credit_card_id ?? '');
    if (ctx) ctx.hasActiveInstallmentPlan = true;
  }
  for (const payment of payments ?? []) {
    const ctx = contexts.get(payment.credit_card_id ?? '');
    if (ctx && ctx.lastPaymentDate == null) {
      ctx.lastPaymentMinor = payment.amount_minor;
      ctx.lastPaymentDate = payment.transaction_date;
    }
  }

  return contexts;
}
