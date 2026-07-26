import { createClient } from '@/lib/supabase/server';
import type { ApiToken } from '@/types/database';

export async function listApiTokens(userId: string): Promise<ApiToken[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('api_tokens')
    .select('*')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });
  return data ?? [];
}
