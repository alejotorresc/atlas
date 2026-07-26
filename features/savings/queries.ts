import { createClient } from '@/lib/supabase/server';
import type { SavingsGoal, SavingsGoalTransaction } from '@/types/database';

export async function listSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('savings_goals').select('*').eq('user_id', userId).order('created_at');
  return data ?? [];
}

export async function getSavingsGoal(userId: string, id: string): Promise<SavingsGoal | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('savings_goals').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
  return data;
}

export async function listGoalContributions(userId: string, goalId: string): Promise<SavingsGoalTransaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('savings_goal_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('savings_goal_id', goalId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
