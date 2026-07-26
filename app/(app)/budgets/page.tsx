import { getCurrentUser } from '@/lib/supabase/server';
import { listBudgets, getCategorySpend } from '@/features/budgets/queries';
import { listCategories } from '@/features/categories/queries';
import { firstDayOfMonthISO, monthLabel } from '@/lib/dates/format';
import { projectBudget } from '@/lib/finance/budgets';
import { Badge } from '@/components/ui/badge';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { BudgetActions } from './budget-form';

function statusTone(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'exceeded') return 'danger';
  if (status === 'warning') return 'warning';
  return 'success';
}

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const month = monthParam ? `${monthParam}-01` : firstDayOfMonthISO();
  const monthKey = month.slice(0, 7);

  const today = new Date();
  const isCurrentMonth = today.toISOString().slice(0, 7) === monthKey;
  const dayOfMonth = isCurrentMonth ? today.getUTCDate() : new Date(Date.UTC(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0)).getUTCDate();
  const totalDaysInMonth = new Date(Date.UTC(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0)).getUTCDate();

  const [budgets, spendByCategory, categories] = await Promise.all([
    listBudgets(user.id, month),
    getCategorySpend(user.id, monthKey),
    listCategories(user.id, 'expense'),
  ]);

  const categoriesById = new Map(categories.map((c) => [c.id, c]));
  const totalPlanned = budgets.reduce((s, b) => s + b.budget_amount_minor, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendByCategory.get(b.category_id) ?? 0), 0);
  const totalRemaining = totalPlanned - totalSpent;
  const exceededCount = budgets.filter((b) => (spendByCategory.get(b.category_id) ?? 0) > b.budget_amount_minor).length;

  return (
    <div className="space-y-[40px]">
      <section>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)] capitalize">
          Presupuestos — {monthLabel(month)}
        </h1>
        {budgets.length > 0 && (
          <>
            <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Disponible en tus presupuestos</p>
            <div className="mt-[4px]">
              <NumericDisplay amountMinor={totalRemaining} size="display" tone={totalRemaining < 0 ? 'negative' : 'neutral'} />
            </div>
            <p className="mt-[8px] text-[15px] text-[var(--ds-neutral-600)]">
              {exceededCount === 0
                ? 'Todas tus categorias estan dentro de lo planeado.'
                : `${exceededCount} ${exceededCount === 1 ? 'categoria ha excedido' : 'categorias han excedido'} su presupuesto.`}
            </p>
          </>
        )}
        <div className="mt-[20px] flex flex-wrap items-center gap-[12px]">
          <BudgetActions month={monthKey} categories={categories} />
          <form method="get" className="flex items-center gap-[8px]">
            <input
              type="month"
              name="month"
              defaultValue={monthKey}
              className="rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] px-[8px] py-[6px] text-[13px]"
            />
            <button type="submit" className="rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] px-[12px] py-[6px] text-[13px]">
              Ver
            </button>
          </form>
        </div>
      </section>

      <section>
        {budgets.length === 0 ? (
          <p className="text-[15px] text-[var(--ds-neutral-600)]">Aun no has asignado presupuestos para este mes.</p>
        ) : (
          <>
            <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">DETALLE POR CATEGORIA</h2>
            <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)]">
              <table className="w-full text-[13px]">
                <thead className="text-left text-[12px] uppercase tracking-[0.02em] text-[var(--ds-neutral-500)]">
                  <tr>
                    <th className="px-[16px] py-[8px]">Categoria</th>
                    <th className="px-[16px] py-[8px] text-right">Asignado</th>
                    <th className="px-[16px] py-[8px] text-right">Gastado</th>
                    <th className="px-[16px] py-[8px] text-right">Restante</th>
                    <th className="px-[16px] py-[8px] text-right">% usado</th>
                    <th className="px-[16px] py-[8px] text-right">Proyeccion fin de mes</th>
                    <th className="px-[16px] py-[8px]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const spent = spendByCategory.get(b.category_id) ?? 0;
                    const projection = projectBudget(b.budget_amount_minor, spent, dayOfMonth, totalDaysInMonth);
                    return (
                      <tr key={b.id} className="border-t border-[var(--ds-neutral-100)]">
                        <td className="px-[16px] py-[8px] text-[var(--ds-neutral-900)]">{categoriesById.get(b.category_id)?.name ?? 'Categoria'}</td>
                        <td className="px-[16px] py-[8px] text-right">
                          <NumericDisplay amountMinor={b.budget_amount_minor} size="small" />
                        </td>
                        <td className="px-[16px] py-[8px] text-right">
                          <NumericDisplay amountMinor={spent} size="small" />
                        </td>
                        <td className="px-[16px] py-[8px] text-right">
                          <NumericDisplay amountMinor={projection.remainingMinor} size="small" />
                        </td>
                        <td className="px-[16px] py-[8px] text-right text-[var(--ds-neutral-600)]">{projection.percentageUsed.toFixed(0)}%</td>
                        <td className="px-[16px] py-[8px] text-right">
                          <NumericDisplay amountMinor={projection.projectedEndOfMonthMinor} size="small" />
                        </td>
                        <td className="px-[16px] py-[8px]">
                          <Badge tone={statusTone(projection.status)}>{projection.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
