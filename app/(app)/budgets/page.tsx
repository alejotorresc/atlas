import { getCurrentUser } from '@/lib/supabase/server';
import { listBudgets, getCategorySpend } from '@/features/budgets/queries';
import { listCategories } from '@/features/categories/queries';
import { formatCurrency } from '@/lib/finance/money';
import { firstDayOfMonthISO, monthLabel } from '@/lib/dates/format';
import { projectBudget } from '@/lib/finance/budgets';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold capitalize">Presupuestos — {monthLabel(month)}</h1>
        <form method="get" className="flex items-center gap-2">
          <input type="month" name="month" defaultValue={monthKey} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
            Ver
          </button>
        </form>
      </div>

      <BudgetActions month={monthKey} categories={categories} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total planeado</p>
          <p className="text-lg font-semibold">{formatCurrency(totalPlanned)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total gastado</p>
          <p className="text-lg font-semibold">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-slate-600">Aun no has asignado presupuestos para este mes.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2 text-right">Asignado</th>
                <th className="px-4 py-2 text-right">Gastado</th>
                <th className="px-4 py-2 text-right">Restante</th>
                <th className="px-4 py-2 text-right">% usado</th>
                <th className="px-4 py-2 text-right">Proyeccion fin de mes</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => {
                const spent = spendByCategory.get(b.category_id) ?? 0;
                const projection = projectBudget(b.budget_amount_minor, spent, dayOfMonth, totalDaysInMonth);
                return (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{categoriesById.get(b.category_id)?.name ?? 'Categoria'}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(b.budget_amount_minor)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(spent)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(projection.remainingMinor)}</td>
                    <td className="px-4 py-2 text-right">{projection.percentageUsed.toFixed(0)}%</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(projection.projectedEndOfMonthMinor)}</td>
                    <td className="px-4 py-2">
                      <Badge tone={statusTone(projection.status)}>{projection.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
