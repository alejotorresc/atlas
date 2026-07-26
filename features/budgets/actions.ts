'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { budgetSchema } from '@/lib/validation/budgets';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertBudget(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = budgetSchema.safeParse({
    category_id: formData.get('category_id'),
    month: formData.get('month'),
    budget_amount: formData.get('budget_amount'),
    rollover_enabled: formData.get('rollover_enabled') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: user.id,
      category_id: parsed.data.category_id,
      month: `${parsed.data.month}-01`,
      budget_amount_minor: parseMoneyToMinorUnits(parsed.data.budget_amount),
      rollover_enabled: parsed.data.rollover_enabled,
    },
    { onConflict: 'user_id,category_id,month' },
  );
  if (error) return { error: 'No se pudo guardar el presupuesto.' };

  revalidatePath('/budgets');
  return { success: true };
}

export async function copyPreviousMonthBudgets(currentMonth: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const [y, m] = currentMonth.split('-').map(Number);
  const prevDate = new Date(Date.UTC(y!, m! - 2, 1));
  const prevMonth = prevDate.toISOString().slice(0, 7) + '-01';

  const supabase = await createClient();
  const { data: previous } = await supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', prevMonth);
  if (!previous || previous.length === 0) return { error: 'No hay presupuestos del mes anterior para copiar.' };

  const rows = previous.map((b) => ({
    user_id: user.id,
    category_id: b.category_id,
    month: `${currentMonth}-01`,
    budget_amount_minor: b.budget_amount_minor,
    rollover_enabled: b.rollover_enabled,
  }));

  const { error } = await supabase.from('budgets').upsert(rows, { onConflict: 'user_id,category_id,month' });
  if (error) return { error: 'No se pudieron copiar los presupuestos.' };

  revalidatePath('/budgets');
  return { success: true };
}
