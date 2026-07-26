'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { cardPaymentSchema, cardSchema } from '@/lib/validation/cards';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function createCard(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = cardSchema.safeParse({
    name: formData.get('name'),
    institution_name: formData.get('institution_name') || '',
    last_four: formData.get('last_four') || '',
    currency: formData.get('currency') || 'GTQ',
    credit_limit: formData.get('credit_limit'),
    current_balance: formData.get('current_balance') || '0',
    statement_day: Number(formData.get('statement_day')),
    payment_due_day: Number(formData.get('payment_due_day')),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('credit_cards').insert({
    user_id: user.id,
    name: parsed.data.name,
    institution_name: parsed.data.institution_name || null,
    last_four: parsed.data.last_four || null,
    currency: parsed.data.currency,
    credit_limit_minor: parseMoneyToMinorUnits(parsed.data.credit_limit),
    current_balance_minor: parseMoneyToMinorUnits(parsed.data.current_balance || '0'),
    statement_day: parsed.data.statement_day,
    payment_due_day: parsed.data.payment_due_day,
  });
  if (error) return { error: 'No se pudo crear la tarjeta.' };

  revalidatePath('/cards');
  return { success: true };
}

export async function updateCard(cardId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = cardSchema
    .omit({ current_balance: true })
    .safeParse({
      name: formData.get('name'),
      institution_name: formData.get('institution_name') || '',
      last_four: formData.get('last_four') || '',
      currency: formData.get('currency') || 'GTQ',
      credit_limit: formData.get('credit_limit'),
      statement_day: Number(formData.get('statement_day')),
      payment_due_day: Number(formData.get('payment_due_day')),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('credit_cards')
    .update({
      name: parsed.data.name,
      institution_name: parsed.data.institution_name || null,
      last_four: parsed.data.last_four || null,
      credit_limit_minor: parseMoneyToMinorUnits(parsed.data.credit_limit),
      statement_day: parsed.data.statement_day,
      payment_due_day: parsed.data.payment_due_day,
    })
    .eq('id', cardId)
    .eq('user_id', user.id);
  if (error) return { error: 'No se pudo actualizar la tarjeta.' };

  revalidatePath('/cards');
  revalidatePath(`/cards/${cardId}`);
  return { success: true };
}

export async function archiveCard(cardId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase.from('credit_cards').update({ is_archived: true }).eq('id', cardId).eq('user_id', user.id);
  if (error) return { error: 'No se pudo archivar la tarjeta.' };

  revalidatePath('/cards');
  return { success: true };
}

export async function payCard(cardId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = cardPaymentSchema.safeParse({
    source_account_id: formData.get('source_account_id'),
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    confirm_exceeds_balance: formData.get('confirm_exceeds_balance') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();

  const amountMinor = parseMoneyToMinorUnits(parsed.data.amount);

  const [{ data: account }, { data: card }] = await Promise.all([
    supabase.from('accounts').select('current_balance_minor').eq('id', parsed.data.source_account_id).eq('user_id', user.id).maybeSingle(),
    supabase.from('credit_cards').select('current_balance_minor').eq('id', cardId).eq('user_id', user.id).maybeSingle(),
  ]);

  if (!account) return { error: 'Cuenta no encontrada.' };
  if (!card) return { error: 'Tarjeta no encontrada.' };

  if (amountMinor > account.current_balance_minor && !parsed.data.confirm_exceeds_balance) {
    return { error: 'CONFIRM_EXCEEDS_ACCOUNT_BALANCE' };
  }
  if (amountMinor > card.current_balance_minor && !parsed.data.confirm_exceeds_balance) {
    return { error: 'CONFIRM_EXCEEDS_CARD_BALANCE' };
  }

  const { error } = await supabase.rpc('create_credit_card_payment', {
    p_source_account_id: parsed.data.source_account_id,
    p_credit_card_id: cardId,
    p_amount_minor: amountMinor,
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_status: 'cleared',
  });
  if (error) return { error: 'No se pudo registrar el pago.' };

  revalidatePath('/cards');
  revalidatePath(`/cards/${cardId}`);
  revalidatePath('/accounts');
  return { success: true };
}
