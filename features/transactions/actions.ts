'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';
import {
  accountExpenseSchema,
  cardExpenseSchema,
  cardPaymentTxSchema,
  incomeSchema,
  refundSchema,
  savingsContributionSchema,
  savingsWithdrawalSchema,
  transferSchema,
} from '@/lib/validation/transactions';
import { balanceAdjustmentSchema } from '@/lib/validation/accounts';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function revalidateAll() {
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/cards');
  revalidatePath('/savings');
  revalidatePath('/');
}

function emptyToNull(value: FormDataEntryValue | string | null | undefined): string | null {
  const v = value?.toString().trim();
  return v ? v : null;
}

export async function createIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = incomeSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    merchant: formData.get('merchant') || '',
    status: formData.get('status') || 'cleared',
    account_id: formData.get('account_id'),
    category_id: formData.get('category_id') || '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_account_income', {
    p_account_id: parsed.data.account_id,
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_merchant: emptyToNull(parsed.data.merchant),
    p_category_id: emptyToNull(parsed.data.category_id),
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar el ingreso.' };

  revalidateAll();
  return { success: true };
}

export async function createAccountExpense(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = accountExpenseSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    merchant: formData.get('merchant') || '',
    status: formData.get('status') || 'cleared',
    account_id: formData.get('account_id'),
    category_id: formData.get('category_id') || '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_account_expense', {
    p_account_id: parsed.data.account_id,
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_merchant: emptyToNull(parsed.data.merchant),
    p_category_id: emptyToNull(parsed.data.category_id),
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar el gasto.' };

  revalidateAll();
  return { success: true };
}

export async function createCardExpense(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = cardExpenseSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    merchant: formData.get('merchant') || '',
    status: formData.get('status') || 'cleared',
    credit_card_id: formData.get('credit_card_id'),
    category_id: formData.get('category_id') || '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_credit_card_expense', {
    p_credit_card_id: parsed.data.credit_card_id,
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_merchant: emptyToNull(parsed.data.merchant),
    p_category_id: emptyToNull(parsed.data.category_id),
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar el gasto.' };

  revalidateAll();
  return { success: true };
}

export async function createTransfer(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = transferSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    status: formData.get('status') || 'cleared',
    source_account_id: formData.get('source_account_id'),
    destination_account_id: formData.get('destination_account_id'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_account_transfer', {
    p_source_account_id: parsed.data.source_account_id,
    p_destination_account_id: parsed.data.destination_account_id,
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar la transferencia.' };

  revalidateAll();
  return { success: true };
}

export async function createCardPayment(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = cardPaymentTxSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    status: formData.get('status') || 'cleared',
    source_account_id: formData.get('source_account_id'),
    credit_card_id: formData.get('credit_card_id'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_credit_card_payment', {
    p_source_account_id: parsed.data.source_account_id,
    p_credit_card_id: parsed.data.credit_card_id,
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar el pago.' };

  revalidateAll();
  return { success: true };
}

export async function createSavingsContribution(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = savingsContributionSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    status: formData.get('status') || 'cleared',
    savings_goal_id: formData.get('savings_goal_id'),
    source_account_id: formData.get('source_account_id') || '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_savings_contribution', {
    p_savings_goal_id: parsed.data.savings_goal_id,
    p_source_account_id: emptyToNull(parsed.data.source_account_id),
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar el aporte.' };

  revalidateAll();
  return { success: true };
}

export async function createSavingsWithdrawal(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = savingsWithdrawalSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    status: formData.get('status') || 'cleared',
    savings_goal_id: formData.get('savings_goal_id'),
    destination_account_id: formData.get('destination_account_id') || '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_savings_withdrawal', {
    p_savings_goal_id: parsed.data.savings_goal_id,
    p_destination_account_id: emptyToNull(parsed.data.destination_account_id),
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_status: parsed.data.status,
  });
  if (error) return { error: error.message.includes('excede') ? 'El monto excede lo ahorrado en la meta.' : 'No se pudo registrar el retiro.' };

  revalidateAll();
  return { success: true };
}

export async function createRefund(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = refundSchema.safeParse({
    amount: formData.get('amount'),
    transaction_date: formData.get('transaction_date'),
    description: formData.get('description'),
    merchant: formData.get('merchant') || '',
    status: formData.get('status') || 'cleared',
    account_id: formData.get('account_id') || '',
    credit_card_id: formData.get('credit_card_id') || '',
    category_id: formData.get('category_id') || '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };
  if (!parsed.data.account_id && !parsed.data.credit_card_id) {
    return { error: 'Selecciona una cuenta o tarjeta' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_refund', {
    p_account_id: emptyToNull(parsed.data.account_id),
    p_credit_card_id: emptyToNull(parsed.data.credit_card_id),
    p_amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    p_currency: 'GTQ',
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
    p_category_id: emptyToNull(parsed.data.category_id),
    p_status: parsed.data.status,
  });
  if (error) return { error: 'No se pudo registrar el reembolso.' };

  revalidateAll();
  return { success: true };
}

export async function createAdjustment(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const accountId = emptyToNull(formData.get('account_id'));
  const creditCardId = emptyToNull(formData.get('credit_card_id'));
  if (!accountId && !creditCardId) return { error: 'Selecciona una cuenta o tarjeta' };

  const parsed = balanceAdjustmentSchema.safeParse({
    new_balance: formData.get('new_balance'),
    description: formData.get('description'),
    transaction_date: formData.get('transaction_date'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_balance_adjustment', {
    p_account_id: accountId,
    p_credit_card_id: creditCardId,
    p_new_balance_minor: parseMoneyToMinorUnits(parsed.data.new_balance),
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
  });
  if (error) return { error: 'No se pudo registrar el ajuste.' };

  revalidateAll();
  return { success: true };
}

export async function cancelTransaction(transactionId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('cancel_transaction', { p_transaction_id: transactionId });
  if (error) return { error: 'No se pudo cancelar el movimiento.' };

  revalidateAll();
  return { success: true };
}
