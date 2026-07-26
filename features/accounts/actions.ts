'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { accountSchema, balanceAdjustmentSchema } from '@/lib/validation/accounts';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function createAccount(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = accountSchema.safeParse({
    name: formData.get('name'),
    institution_name: formData.get('institution_name') || '',
    account_type: formData.get('account_type'),
    currency: formData.get('currency') || 'GTQ',
    opening_balance: formData.get('opening_balance'),
    include_in_available_balance: formData.get('include_in_available_balance') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const openingBalanceMinor = parseMoneyToMinorUnits(parsed.data.opening_balance);
  const supabase = await createClient();
  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: parsed.data.name,
    institution_name: parsed.data.institution_name || null,
    account_type: parsed.data.account_type,
    currency: parsed.data.currency,
    opening_balance_minor: openingBalanceMinor,
    current_balance_minor: openingBalanceMinor,
    include_in_available_balance: parsed.data.include_in_available_balance,
  });
  if (error) return { error: 'No se pudo crear la cuenta.' };

  revalidatePath('/accounts');
  return { success: true };
}

export async function updateAccount(accountId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = accountSchema
    .omit({ opening_balance: true })
    .safeParse({
      name: formData.get('name'),
      institution_name: formData.get('institution_name') || '',
      account_type: formData.get('account_type'),
      currency: formData.get('currency') || 'GTQ',
      include_in_available_balance: formData.get('include_in_available_balance') === 'on',
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('accounts')
    .update({
      name: parsed.data.name,
      institution_name: parsed.data.institution_name || null,
      account_type: parsed.data.account_type,
      currency: parsed.data.currency,
      include_in_available_balance: parsed.data.include_in_available_balance,
    })
    .eq('id', accountId)
    .eq('user_id', user.id);
  if (error) return { error: 'No se pudo actualizar la cuenta.' };

  revalidatePath('/accounts');
  revalidatePath(`/accounts/${accountId}`);
  return { success: true };
}

export async function archiveAccount(accountId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase.from('accounts').update({ is_archived: true }).eq('id', accountId).eq('user_id', user.id);
  if (error) return { error: 'No se pudo archivar la cuenta.' };

  revalidatePath('/accounts');
  return { success: true };
}

export async function adjustAccountBalance(accountId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = balanceAdjustmentSchema.safeParse({
    new_balance: formData.get('new_balance'),
    description: formData.get('description'),
    transaction_date: formData.get('transaction_date'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_balance_adjustment', {
    p_account_id: accountId,
    p_credit_card_id: null,
    p_new_balance_minor: parseMoneyToMinorUnits(parsed.data.new_balance),
    p_transaction_date: parsed.data.transaction_date,
    p_description: parsed.data.description,
  });
  if (error) return { error: 'No se pudo ajustar el saldo.' };

  revalidatePath('/accounts');
  revalidatePath(`/accounts/${accountId}`);
  return { success: true };
}
