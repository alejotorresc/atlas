'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { cardPaymentSchema, cardSchema } from '@/lib/validation/cards';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';
import { splitPayment } from '@/lib/finance/interest';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export interface PayCardResult extends ActionResult {
  interestPortionMinor?: number;
  principalPortionMinor?: number;
  amountMinor?: number;
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
    minimum_payment: formData.get('minimum_payment') || '',
    annual_interest_rate: formData.get('annual_interest_rate') || '',
    interest_calculation_method: formData.get('interest_calculation_method') || 'statement_balance',
    interest_free_days: formData.get('interest_free_days') || 21,
    minimum_payment_percentage: formData.get('minimum_payment_percentage') || '',
    late_fee: formData.get('late_fee') || '',
    annual_fee: formData.get('annual_fee') || '',
    in_payment_agreement: formData.get('in_payment_agreement') === 'on',
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
    minimum_payment_minor: parsed.data.minimum_payment ? parseMoneyToMinorUnits(parsed.data.minimum_payment) : null,
    annual_interest_rate: parsed.data.annual_interest_rate ? parseFloat(parsed.data.annual_interest_rate) : null,
    interest_calculation_method: parsed.data.interest_calculation_method,
    interest_free_days: parsed.data.interest_free_days,
    minimum_payment_percentage: parsed.data.minimum_payment_percentage ? parseFloat(parsed.data.minimum_payment_percentage) / 100 : null,
    late_fee_minor: parsed.data.late_fee ? parseMoneyToMinorUnits(parsed.data.late_fee) : 0,
    annual_fee_minor: parsed.data.annual_fee ? parseMoneyToMinorUnits(parsed.data.annual_fee) : 0,
    in_payment_agreement: parsed.data.in_payment_agreement ?? false,
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
      minimum_payment: formData.get('minimum_payment') || '',
      annual_interest_rate: formData.get('annual_interest_rate') || '',
      interest_calculation_method: formData.get('interest_calculation_method') || 'statement_balance',
      interest_free_days: formData.get('interest_free_days') || 21,
      minimum_payment_percentage: formData.get('minimum_payment_percentage') || '',
      late_fee: formData.get('late_fee') || '',
      annual_fee: formData.get('annual_fee') || '',
      in_payment_agreement: formData.get('in_payment_agreement') === 'on',
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
      minimum_payment_minor: parsed.data.minimum_payment ? parseMoneyToMinorUnits(parsed.data.minimum_payment) : null,
      annual_interest_rate: parsed.data.annual_interest_rate ? parseFloat(parsed.data.annual_interest_rate) : null,
      interest_calculation_method: parsed.data.interest_calculation_method,
      interest_free_days: parsed.data.interest_free_days,
      minimum_payment_percentage: parsed.data.minimum_payment_percentage ? parseFloat(parsed.data.minimum_payment_percentage) / 100 : null,
      late_fee_minor: parsed.data.late_fee ? parseMoneyToMinorUnits(parsed.data.late_fee) : 0,
      annual_fee_minor: parsed.data.annual_fee ? parseMoneyToMinorUnits(parsed.data.annual_fee) : 0,
      in_payment_agreement: parsed.data.in_payment_agreement ?? false,
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

export async function payCard(cardId: string, formData: FormData): Promise<PayCardResult> {
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
    supabase
      .from('credit_cards')
      .select('current_balance_minor, statement_balance_minor, interest_calculation_method, annual_interest_rate')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (!account) return { error: 'Cuenta no encontrada.' };
  if (!card) return { error: 'Tarjeta no encontrada.' };

  if (amountMinor > account.current_balance_minor && !parsed.data.confirm_exceeds_balance) {
    return { error: 'CONFIRM_EXCEEDS_ACCOUNT_BALANCE' };
  }
  if (amountMinor > card.current_balance_minor && !parsed.data.confirm_exceeds_balance) {
    return { error: 'CONFIRM_EXCEEDS_CARD_BALANCE' };
  }

  const { interestPortionMinor, principalPortionMinor } = splitPayment(amountMinor, card, card.annual_interest_rate ?? 0);

  const { error } = await supabase.rpc('create_credit_card_payment', {
    p_source_account_id: parsed.data.source_account_id,
    p_credit_card_id: cardId,
    p_amount_minor: amountMinor,
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_status: 'cleared',
    p_interest_portion_minor: interestPortionMinor,
    p_principal_portion_minor: principalPortionMinor,
  });
  if (error) return { error: 'No se pudo registrar el pago.' };

  revalidatePath('/cards');
  revalidatePath(`/cards/${cardId}`);
  revalidatePath(`/cards/${cardId}/debt`);
  revalidatePath('/cards/overview');
  revalidatePath('/accounts');
  return { success: true, interestPortionMinor, principalPortionMinor, amountMinor };
}
