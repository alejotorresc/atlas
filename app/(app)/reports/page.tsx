import { getCurrentUser } from '@/lib/supabase/server';
import { getCardUtilizationReport, getExpenseDistribution, getMonthlySummaries } from '@/features/reports/queries';
import { formatCurrency } from '@/lib/finance/money';
import { firstDayOfMonthISO } from '@/lib/dates/format';
import { Card } from '@/components/ui/card';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { MonthPicker } from '@/components/ui/date-picker';
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
    <div className="space-y-[40px]">
      <section>
        <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Reportes</h1>
        {currentMonthSummary && (
          <>
            <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Flujo neto del mes</p>
            <div className="mt-[4px]">
              <NumericDisplay
                amountMinor={currentMonthSummary.netCashFlow}
                size="display"
                tone={currentMonthSummary.netCashFlow < 0 ? 'negative' : 'neutral'}
              />
            </div>
            <p className="mt-[8px] text-[15px] text-[var(--ds-neutral-600)]">
              Ingresos <NumericDisplay amountMinor={currentMonthSummary.income} size="small" className="inline" /> · Gastos{' '}
              <NumericDisplay amountMinor={currentMonthSummary.expenses} size="small" className="inline" />
            </p>
          </>
        )}
        <div className="mt-[20px] flex flex-wrap items-center gap-[12px]">
          <form method="get" className="flex items-center gap-[8px]">
            <MonthPicker name="month" defaultValue={month} />
            <button type="submit" className="rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] px-[12px] py-[6px] text-[13px]">
              Ver mes
            </button>
          </form>
          <a
            href={exportHref}
            className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-[12px] py-[6px] text-[13px] font-medium text-white"
          >
            Exportar CSV
          </a>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">Ingresos vs. gastos (6 meses)</h2>
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
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">Distribucion de gastos por categoria — {month}</h2>
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
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">Comparativo de gastos mes a mes</h2>
        <Card>
          <ExpenseComparisonChart data={monthlySummaries} />
        </Card>
      </section>

      <section>
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">Aportes a ahorro por mes</h2>
        <Card>
          <SavingsContributionsChart data={monthlySummaries} />
        </Card>
      </section>

      <section>
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">Saldos y utilizacion de tarjetas</h2>
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
