'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import {
  budgetAlert,
  creditUtilizationAlert,
  lowSafeToSpendAlert,
  obligationDueAlert,
  obligationOverdueAlert,
  savingsGoalBehindAlert,
  savingsGoalReachedAlert,
  deduplicateAlerts,
  type AlertCandidate,
} from '@/lib/finance/alerts';
import { creditUtilization, highestUtilizationThresholdReached } from '@/lib/finance/credit';
import { projectBudget } from '@/lib/finance/budgets';
import { calculateSavingsPace } from '@/lib/finance/savings-pace';
import { formatCurrency } from '@/lib/finance/money';
import { computeSafeToSpend } from '@/features/dashboard/queries';
import { addDaysUtc } from '@/lib/finance/dates';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function refreshAlerts(userId: string): Promise<void> {
  const supabase = await createClient();
  const candidates: AlertCandidate[] = [];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const monthKey = todayStr.slice(0, 7);

  const { data: obligations } = await supabase.from('recurring_obligations').select('*').eq('user_id', userId).eq('is_active', true);
  const { data: occurrences } = await supabase
    .from('obligation_occurrences')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['upcoming', 'pending', 'overdue']);

  const obligationsById = new Map((obligations ?? []).map((o) => [o.id, o]));
  for (const occ of occurrences ?? []) {
    const obligation = obligationsById.get(occ.recurring_obligation_id);
    if (!obligation) continue;
    const dueDate = new Date(`${occ.due_date}T00:00:00.000Z`);
    const reminderDate = addDaysUtc(dueDate, -obligation.reminder_days_before);

    if (occ.status === 'overdue') {
      candidates.push(obligationOverdueAlert({ obligationId: obligation.id, name: obligation.name, dueDate: occ.due_date }));
    } else if (today >= reminderDate && today <= dueDate) {
      candidates.push(
        obligationDueAlert({
          obligationId: obligation.id,
          name: obligation.name,
          dueDate: occ.due_date,
          amountFormatted: formatCurrency(occ.expected_amount_minor, obligation.currency),
        }),
      );
    }
  }

  const { data: cards } = await supabase.from('credit_cards').select('*').eq('user_id', userId).eq('is_archived', false);
  for (const card of cards ?? []) {
    const utilization = creditUtilization(card.current_balance_minor, card.credit_limit_minor);
    const threshold = highestUtilizationThresholdReached(utilization);
    if (threshold !== null) {
      candidates.push(creditUtilizationAlert({ cardId: card.id, cardName: card.name, threshold, utilization, effectiveDate: todayStr }));
    }
  }

  const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', userId).eq('month', `${monthKey}-01`);
  const { data: categories } = await supabase.from('categories').select('id, name').eq('user_id', userId);
  const categoriesById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const dayOfMonth = today.getUTCDate();
  const totalDaysInMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate();

  for (const budget of budgets ?? []) {
    const { data: spendRows } = await supabase
      .from('transactions')
      .select('amount_minor')
      .eq('user_id', userId)
      .eq('category_id', budget.category_id)
      .eq('transaction_type', 'expense')
      .eq('status', 'cleared')
      .gte('transaction_date', `${monthKey}-01`)
      .lte('transaction_date', todayStr);
    const spent = (spendRows ?? []).reduce((s, r) => s + r.amount_minor, 0);
    const projection = projectBudget(budget.budget_amount_minor, spent, dayOfMonth, totalDaysInMonth);
    if (projection.status !== 'healthy') {
      candidates.push(
        budgetAlert({
          categoryId: budget.category_id,
          categoryName: categoriesById.get(budget.category_id) ?? 'Categoria',
          month: monthKey,
          percentageUsed: projection.percentageUsed,
          exceeded: projection.status === 'exceeded',
        }),
      );
    }
  }

  const safeToSpend = await computeSafeToSpend(userId);
  if (safeToSpend.safeToSpendMinor < 0) {
    candidates.push(lowSafeToSpendAlert({ userId, effectiveDate: todayStr }));
  }

  const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', userId).eq('status', 'active');
  for (const goal of goals ?? []) {
    if (goal.current_amount_minor >= goal.target_amount_minor) {
      candidates.push(savingsGoalReachedAlert({ goalId: goal.id, goalName: goal.name, effectiveDate: todayStr }));
      continue;
    }
    if (goal.target_date) {
      const createdMonthsAgo = Math.max(
        1,
        Math.round((today.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)),
      );
      const pace = calculateSavingsPace(goal.current_amount_minor, goal.target_amount_minor, new Date(goal.target_date), today, createdMonthsAgo);
      if (pace.status === 'behind') {
        candidates.push(savingsGoalBehindAlert({ goalId: goal.id, goalName: goal.name, month: monthKey }));
      }
    }
  }

  const { data: existingAlerts } = await supabase.from('alerts').select('deduplication_key').eq('user_id', userId);
  const existingKeys = new Set((existingAlerts ?? []).map((a) => a.deduplication_key));
  const toInsert = deduplicateAlerts(candidates, existingKeys).map((c) => ({ user_id: userId, ...c }));

  if (toInsert.length > 0) {
    await supabase.from('alerts').upsert(toInsert, { onConflict: 'user_id,deduplication_key', ignoreDuplicates: true });
  }
}

export async function manualRefreshAlerts(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };
  await refreshAlerts(user.id);
  revalidatePath('/alerts');
  revalidatePath('/');
  return { success: true };
}

export async function markAlertRead(alertId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };
  const supabase = await createClient();
  const { error } = await supabase.from('alerts').update({ read_at: new Date().toISOString() }).eq('id', alertId).eq('user_id', user.id);
  if (error) return { error: 'No se pudo marcar como leida.' };
  revalidatePath('/alerts');
  return { success: true };
}

export async function markAllAlertsRead(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };
  const supabase = await createClient();
  const { error } = await supabase.from('alerts').update({ read_at: new Date().toISOString() }).eq('user_id', user.id).is('read_at', null);
  if (error) return { error: 'No se pudo actualizar.' };
  revalidatePath('/alerts');
  return { success: true };
}

export async function dismissAlert(alertId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };
  const supabase = await createClient();
  const { error } = await supabase.from('alerts').update({ dismissed_at: new Date().toISOString() }).eq('id', alertId).eq('user_id', user.id);
  if (error) return { error: 'No se pudo descartar la alerta.' };
  revalidatePath('/alerts');
  return { success: true };
}
