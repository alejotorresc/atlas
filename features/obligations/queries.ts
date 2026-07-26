import { createClient } from '@/lib/supabase/server';
import type { ObligationOccurrence, RecurringObligation } from '@/types/database';

export async function listObligations(userId: string): Promise<RecurringObligation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('recurring_obligations')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('next_due_date');
  return data ?? [];
}

export async function getObligation(userId: string, id: string): Promise<RecurringObligation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('recurring_obligations').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  return data;
}

export async function listUpcomingOccurrences(userId: string, fromDate: string, toDate: string): Promise<ObligationOccurrence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('obligation_occurrences')
    .select('*')
    .eq('user_id', userId)
    .gte('due_date', fromDate)
    .lte('due_date', toDate)
    .order('due_date');
  return data ?? [];
}

export async function listOccurrencesForObligation(userId: string, obligationId: string): Promise<ObligationOccurrence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('obligation_occurrences')
    .select('*')
    .eq('user_id', userId)
    .eq('recurring_obligation_id', obligationId)
    .order('due_date');
  return data ?? [];
}

export async function listUnpaidOccurrencesDue(userId: string, upToDate: string): Promise<ObligationOccurrence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('obligation_occurrences')
    .select('*')
    .eq('user_id', userId)
    .lte('due_date', upToDate)
    .in('status', ['upcoming', 'pending', 'overdue', 'partial']);
  return data ?? [];
}
