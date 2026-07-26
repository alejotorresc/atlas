'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { generateApiToken, hashApiToken } from '@/lib/security/api-tokens';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export interface CreateApiTokenResult extends ActionResult {
  token?: string;
}

export async function createApiToken(formData: FormData): Promise<CreateApiTokenResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const name = (formData.get('name')?.toString().trim() || 'iPhone Shortcuts').slice(0, 60);
  const token = generateApiToken();

  const supabase = await createClient();
  const { error } = await supabase.from('api_tokens').insert({
    user_id: user.id,
    name,
    token_hash: hashApiToken(token),
  });
  if (error) return { error: 'No se pudo crear el token.' };

  revalidatePath('/settings');
  return { success: true, token };
}

export async function revokeApiToken(tokenId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('api_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', tokenId)
    .eq('user_id', user.id);
  if (error) return { error: 'No se pudo revocar el token.' };

  revalidatePath('/settings');
  return { success: true };
}
