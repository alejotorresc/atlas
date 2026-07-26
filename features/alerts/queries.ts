import { createClient } from '@/lib/supabase/server';
import type { Alert } from '@/types/database';

export async function getUnreadAlertsCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)
    .is('dismissed_at', null);
  return count ?? 0;
}

export async function listAlerts(userId: string): Promise<Alert[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .is('dismissed_at', null)
    .order('read_at', { nullsFirst: true })
    .order('effective_date', { ascending: false });
  return data ?? [];
}
