import { getCurrentUser } from '@/lib/supabase/server';
import { getCardUtilizationReport, getExpenseDistribution, getMonthlySummaries } from '@/features/reports/queries';
import { formatCurrency } from '@/lib/finance/money';
import { firstDayOfMonthISO } from '@/lib/dates/format';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import {
  ExpenseComparisonChart,
  ExpenseDistributionChart,
  IncomeExpenseChart,
  SavingsContributionsChart,
} from './reports-charts';

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const month = monthParam ?? firstDayOfMonthISO().slice(0, 7);
  const [monthlySummaries, expenseDistribution, cardUtilization] = await Promise.all([
    getMonthlySummaries(user.id, 6),
    getExpenseDistribution(user.id, month),
    getCardUtilizationReport(user.id),
  ]);

  const currentMonthSummary = monthlySummaries[monthlySummaries.length - 1];
  const exportHref = `/api/export?month=${month}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <div className="flex items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <input type="month" name="month" defaultValue={month} className="rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm" />
            <button type="submit" className="rounded-md border border-[var(--ds-neutral-300)] px-3 py-1.5 text-sm">
              Ver mes
            </button>
          </form>
          <a href={exportHref} className="rounded-md bg-[var(--ds-color-primary)] px-3 py-1.5 text-sm font-medium text-white">
            Exportar CSV
          </a>
        </div>
      </div>

      {currentMonthSummary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardTitle>Ingresos del mes</CardTitle>
            <CardValue>{formatCurrency(currentMonthSummary.income)}</CardValue>
          </Card>
          <Card>
            <CardTitle>Gastos del mes</CardTitle>
            <CardValue>{formatCurrency(currentMonthSummary.expenses)}</CardValue>
          </Card>
          <Card>
            <CardTitle>Flujo neto</CardTitle>
            <CardValue>{formatCurrency(currentMonthSummary.netCashFlow)}</CardValue>
          </Card>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Ingresos vs. gastos (6 meses)</h2>
        <Card>
          <IncomeExpenseChart data={monthlySummaries} />
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Ingresos y gastos por mes</caption>
            <thead className="text-left text-xs uppercase text-[var(--ds-neutral-500)]">
              <tr>
                <th className="py-1">Mes</th>
                <th className="py-1 text-right">Ingresos</th>
                <th className="py-1 text-right">Gastos</th>
                <th className="py-1 text-right">Flujo neto</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummaries.map((m) => (
                <tr key={m.month} className="border-t border-[var(--ds-neutral-100)]">
                  <td className="py-1">{m.month}</td>
                  <td className="py-1 text-right">{formatCurrency(m.income)}</td>
                  <td className="py-1 text-right">{formatCurrency(m.expenses)}</td>
                  <td className="py-1 text-right">{formatCurrency(m.netCashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Distribucion de gastos por categoria — {month}</h2>
        <Card>
          <ExpenseDistributionChart data={expenseDistribution} />
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Gastos por categoria</caption>
            <thead className="text-left text-xs uppercase text-[var(--ds-neutral-500)]">
              <tr>
                <th className="py-1">Categoria</th>
                <th className="py-1 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {expenseDistribution.map((c) => (
                <tr key={c.categoryId} className="border-t border-[var(--ds-neutral-100)]">
                  <td className="py-1">{c.categoryName}</td>
                  <td className="py-1 text-right">{formatCurrency(c.amountMinor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Comparativo de gastos mes a mes</h2>
        <Card>
          <ExpenseComparisonChart data={monthlySummaries} />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Aportes a ahorro por mes</h2>
        <Card>
          <SavingsContributionsChart data={monthlySummaries} />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Saldos y utilizacion de tarjetas</h2>
        <Card>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-[var(--ds-neutral-500)]">
              <tr>
                <th className="py-1">Tarjeta</th>
                <th className="py-1 text-right">Saldo</th>
                <th className="py-1 text-right">Limite</th>
                <th className="py-1 text-right">Utilizacion</th>
              </tr>
            </thead>
            <tbody>
              {cardUtilization.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-[var(--ds-neutral-500)]">
                    Sin tarjetas registradas.
                  </td>
                </tr>
              )}
              {cardUtilization.map((c) => (
                <tr key={c.cardId} className="border-t border-[var(--ds-neutral-100)]">
                  <td className="py-1">{c.cardName}</td>
                  <td className="py-1 text-right">{formatCurrency(c.currentBalanceMinor)}</td>
                  <td className="py-1 text-right">{formatCurrency(c.creditLimitMinor)}</td>
                  <td className="py-1 text-right">{c.utilization.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
