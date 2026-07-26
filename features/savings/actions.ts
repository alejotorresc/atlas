'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { savingsGoalSchema } from '@/lib/validation/savings';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';
import type { GoalStatus } from '@/types/database';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const v = value?.toString().trim();
  return v ? v : null;
}

export async function createSavingsGoal(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = savingsGoalSchema.safeParse({
    name: formData.get('name'),
    target_amount: formData.get('target_amount'),
    target_date: formData.get('target_date') || '',
    linked_account_id: formData.get('linked_account_id') || '',
    priority: formData.get('priority') || 'medium',
    exclude_from_available_balance: formData.get('exclude_from_available_balance') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name: parsed.data.name,
    target_amount_minor: parseMoneyToMinorUnits(parsed.data.target_amount),
    currency: 'GTQ',
    target_date: parsed.data.target_date || null,
    linked_account_id: emptyToNull(formData.get('linked_account_id')),
    priority: parsed.data.priority,
    exclude_from_available_balance: parsed.data.exclude_from_available_balance,
  });
  if (error) return { error: 'No se pudo crear la meta.' };

  revalidatePath('/savings');
  return { success: true };
}

export async function updateSavingsGoal(goalId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = savingsGoalSchema.safeParse({
    name: formData.get('name'),
    target_amount: formData.get('target_amount'),
    target_date: formData.get('target_date') || '',
    linked_account_id: formData.get('linked_account_id') || '',
    priority: formData.get('priority') || 'medium',
    exclude_from_available_balance: formData.get('exclude_from_available_balance') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('savings_goals')
    .update({
      name: parsed.data.name,
      target_amount_minor: parseMoneyToMinorUnits(parsed.data.target_amount),
      target_date: parsed.data.target_date || null,
      linked_account_id: emptyToNull(formData.get('linked_account_id')),
      priority: parsed.data.priority,
      exclude_from_available_balance: parsed.data.exclude_from_available_balance,
    })
    .eq('id', goalId)
    .eq('user_id', user.id);
  if (error) return { error: 'No se pudo actualizar la meta.' };

  revalidatePath('/savings');
  revalidatePath(`/savings/${goalId}`);
  return { success: true };
}

export async function setSavingsGoalStatus(goalId: string, status: GoalStatus): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase.from('savings_goals').update({ status }).eq('id', goalId).eq('user_id', user.id);
  if (error) return { error: 'No se pudo actualizar el estado de la meta.' };

  revalidatePath('/savings');
  revalidatePath(`/savings/${goalId}`);
  return { success: true };
}
