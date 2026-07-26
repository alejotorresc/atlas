'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { markPaidSchema, obligationSchema } from '@/lib/validation/obligations';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';
import { defaultGenerationHorizon, generateOccurrences } from '@/lib/finance/recurrence';
import { isOverdue } from '@/lib/finance/recurrence';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const v = value?.toString().trim();
  return v ? v : null;
}

export async function createObligation(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = obligationSchema.safeParse({
    name: formData.get('name'),
    obligation_type: formData.get('obligation_type'),
    amount_type: formData.get('amount_type') || 'fixed',
    amount: formData.get('amount'),
    frequency: formData.get('frequency'),
    next_due_date: formData.get('next_due_date'),
    end_date: formData.get('end_date') || '',
    account_id: formData.get('account_id') || '',
    credit_card_id: formData.get('credit_card_id') || '',
    category_id: formData.get('category_id') || '',
    reminder_days_before: formData.get('reminder_days_before') || 3,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('recurring_obligations').insert({
    user_id: user.id,
    name: parsed.data.name,
    obligation_type: parsed.data.obligation_type,
    amount_type: parsed.data.amount_type,
    amount_minor: parseMoneyToMinorUnits(parsed.data.amount),
    currency: 'GTQ',
    frequency: parsed.data.frequency,
    next_due_date: parsed.data.next_due_date,
    end_date: parsed.data.end_date || null,
    account_id: emptyToNull(formData.get('account_id')),
    credit_card_id: emptyToNull(formData.get('credit_card_id')),
    category_id: emptyToNull(formData.get('category_id')),
    reminder_days_before: parsed.data.reminder_days_before,
  });
  if (error) return { error: 'No se pudo crear la obligacion.' };

  await generateOccurrencesForUser(user.id);
  revalidatePath('/obligations');
  revalidatePath('/calendar');
  return { success: true };
}

export async function toggleObligationActive(obligationId: string, isActive: boolean): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('recurring_obligations')
    .update({ is_active: isActive })
    .eq('id', obligationId)
    .eq('user_id', user.id);
  if (error) return { error: 'No se pudo actualizar la obligacion.' };

  revalidatePath('/obligations');
  revalidatePath('/calendar');
  return { success: true };
}

export async function markOccurrencePaid(occurrenceId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = markPaidSchema.safeParse({
    account_id: formData.get('account_id') || '',
    credit_card_id: formData.get('credit_card_id') || '',
    actual_amount: formData.get('actual_amount'),
    transaction_date: formData.get('transaction_date'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };
  if (!parsed.data.account_id && !parsed.data.credit_card_id) return { error: 'Selecciona cuenta o tarjeta de pago' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('mark_obligation_occurrence_paid', {
    p_occurrence_id: occurrenceId,
    p_account_id: emptyToNull(formData.get('account_id')),
    p_credit_card_id: emptyToNull(formData.get('credit_card_id')),
    p_actual_amount_minor: parseMoneyToMinorUnits(parsed.data.actual_amount),
    p_transaction_date: parsed.data.transaction_date,
  });
  if (error) return { error: 'No se pudo registrar el pago.' };

  revalidatePath('/obligations');
  revalidatePath('/calendar');
  revalidatePath('/accounts');
  revalidatePath('/cards');
  return { success: true };
}

export async function skipOccurrence(occurrenceId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase.rpc('skip_obligation_occurrence', { p_occurrence_id: occurrenceId });
  if (error) return { error: 'No se pudo omitir la ocurrencia.' };

  revalidatePath('/obligations');
  revalidatePath('/calendar');
  return { success: true };
}

/**
 * Generates occurrences for the current month plus the next two months for
 * all active obligations, skipping due dates that already exist. Safe to
 * call repeatedly (idempotent) — intended to run on obligation mutations
 * and opportunistically when obligations/calendar pages load.
 */
export async function generateOccurrencesForUser(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data: obligations } = await supabase
    .from('recurring_obligations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);
  if (!obligations || obligations.length === 0) return;

  const today = new Date();
  const horizon = defaultGenerationHorizon(today);

  const { data: existing } = await supabase
    .from('obligation_occurrences')
    .select('recurring_obligation_id, due_date')
    .eq('user_id', userId);

  const existingByObligation = new Map<string, Set<string>>();
  for (const row of existing ?? []) {
    const set = existingByObligation.get(row.recurring_obligation_id) ?? new Set<string>();
    set.add(row.due_date);
    existingByObligation.set(row.recurring_obligation_id, set);
  }

  const toInsert = obligations.flatMap((obligation) =>
    generateOccurrences(obligation, horizon, existingByObligation.get(obligation.id) ?? new Set()).map((occ) => ({
      user_id: userId,
      recurring_obligation_id: occ.recurring_obligation_id,
      due_date: occ.due_date,
      expected_amount_minor: occ.expected_amount_minor,
    })),
  );

  if (toInsert.length === 0) return;

  await supabase.from('obligation_occurrences').upsert(toInsert, {
    onConflict: 'recurring_obligation_id,due_date',
    ignoreDuplicates: true,
  });

  const { data: overdueCandidates } = await supabase
    .from('obligation_occurrences')
    .select('id, due_date, status')
    .eq('user_id', userId)
    .in('status', ['upcoming', 'pending']);

  const overdueIds = (overdueCandidates ?? []).filter((o) => isOverdue(o.due_date, today)).map((o) => o.id);
  if (overdueIds.length > 0) {
    await supabase.from('obligation_occurrences').update({ status: 'overdue' }).in('id', overdueIds);
  }
}
