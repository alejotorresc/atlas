'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validation/profile';
import { accountSchema } from '@/lib/validation/accounts';
import { cardSchema } from '@/lib/validation/cards';
import { onboardingIncomeSchema } from '@/lib/validation/profile';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function saveOnboardingProfile(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = profileSchema.safeParse({
    display_name: formData.get('display_name'),
    primary_currency: formData.get('primary_currency') || 'GTQ',
    locale: formData.get('locale') || 'es-GT',
    timezone: formData.get('timezone') || 'America/Guatemala',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').upsert({ id: user.id, ...parsed.data });
  if (error) return { error: 'No se pudo guardar el perfil.' };

  return { success: true };
}

export async function createOnboardingAccount(formData: FormData): Promise<ActionResult> {
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

  return { success: true };
}

export async function createOnboardingCard(formData: FormData): Promise<ActionResult> {
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

  return { success: true };
}

export async function createOnboardingIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = onboardingIncomeSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    next_due_date: formData.get('next_due_date'),
    frequency: formData.get('frequency'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    transaction_type: 'income',
    amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    currency: 'GTQ',
    transaction_date: parsed.data.next_due_date,
    description: parsed.data.description,
    status: 'pending',
  });
  if (error) return { error: 'No se pudo registrar el ingreso esperado.' };

  return { success: true };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error: seedError } = await supabase.rpc('seed_default_categories', { p_user_id: user.id });
  if (seedError) return { error: 'No se pudieron crear las categorias por defecto.' };

  const { error } = await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
  if (error) return { error: 'No se pudo finalizar la configuracion.' };

  revalidatePath('/');
  return { success: true };
}
