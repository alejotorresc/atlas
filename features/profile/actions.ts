'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { financialPreferencesSchema, profileSchema } from '@/lib/validation/profile';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
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
  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id);
  if (error) return { error: 'No se pudo actualizar el perfil.' };

  revalidatePath('/settings');
  return { success: true };
}

export async function updateFinancialPreferences(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = financialPreferencesSchema.safeParse({
    default_obligation_horizon_days: formData.get('default_obligation_horizon_days'),
    pending_affects_safe_to_spend: formData.get('pending_affects_safe_to_spend') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id);
  if (error) return { error: 'No se pudo actualizar las preferencias.' };

  revalidatePath('/settings');
  revalidatePath('/');
  return { success: true };
}
