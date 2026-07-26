import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { getDashboardData } from '@/features/dashboard/queries';
import { refreshAlerts } from '@/features/alerts/actions';
import { formatDateGT } from '@/lib/dates/format';
import { savingsProgressRatio } from '@/lib/finance/savings-pace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SafeToSpendCard } from '@/components/finance/safe-to-spend-card';
import { MetricCard, TransactionCard } from '@/components/design-system/Cards';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await refreshAlerts(user.id);
  const data = await getDashboardData(user.id);

  if (!data.hasAnyAccount) {
    return (
      <Card>
        <p className="mb-[16px] text-[15px] text-[var(--ds-neutral-600)]">
          Aun no tienes cuentas registradas. Crea tu primera cuenta para comenzar a ver tu panorama financiero.
        </p>
        <Link href="/accounts">
          <Button>Crear cuenta</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-[24px]">
      <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Inicio</h1>

      <SafeToSpendCard breakdown={data.safeToSpend} />

      <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Saldo total en cuentas" amountMinor={data.liquidBalance} />
        <MetricCard label="Deuda en tarjetas" amountMinor={data.creditCardDebt} />
        <MetricCard label="Posicion neta" amountMinor={data.netPosition} />
        <Card>
          <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Flujo neto del mes</p>
          <div className="mt-[4px]">
            <NumericDisplay amountMinor={data.monthNetCashFlow} size="numericDisplay" tone={data.monthNetCashFlow < 0 ? 'negative' : 'neutral'} />
          </div>
        </Card>
        <MetricCard label="Ingresos del mes" amountMinor={data.monthIncome} />
        <MetricCard label="Gastos del mes" amountMinor={data.monthExpenses} />
        <Card>
          <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Proximo ingreso esperado</p>
          <div className="mt-[4px]">
            {data.nextExpectedIncome ? (
              <NumericDisplay amountMinor={data.nextExpectedIncome.amount_minor} size="numericDisplay" />
            ) : (
              <p className="text-[28px] font-medium text-[var(--ds-neutral-400)]">Sin datos</p>
            )}
          </div>
          {data.nextExpectedIncome && (
            <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">{formatDateGT(data.nextExpectedIncome.transaction_date)}</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">OBLIGACIONES POR VENCER</h2>
        <div className="grid grid-cols-3 gap-[16px]">
          <MetricCard label="7 dias" amountMinor={data.upcoming7} />
          <MetricCard label="15 dias" amountMinor={data.upcoming15} />
          <MetricCard label="30 dias" amountMinor={data.upcoming30} />
        </div>
      </div>

      <div className="grid gap-[24px] lg:grid-cols-2">
        <div>
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">MOVIMIENTOS RECIENTES</h2>
            <Link href="/transactions" className="text-[13px] text-[var(--ds-neutral-500)] underline">
              Ver todos
            </Link>
          </div>
          {data.recentTransactions.length === 0 ? (
            <Card>
              <p className="text-[15px] text-[var(--ds-neutral-600)]">Sin movimientos todavia.</p>
            </Card>
          ) : (
            <div className="space-y-[8px]">
              {data.recentTransactions.map((t) => {
                const type =
                  t.transaction_type === 'income' || t.transaction_type === 'refund' || t.transaction_type === 'savings_withdrawal'
                    ? 'income'
                    : t.transaction_type === 'transfer' || t.transaction_type === 'credit_card_payment'
                      ? 'transfer'
                      : 'expense';
                return (
                  <TransactionCard
                    key={t.id}
                    type={type}
                    description={t.description}
                    date={formatDateGT(t.transaction_date)}
                    amountMinor={t.amount_minor}
                    currency={t.currency}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">ALERTAS ACTIVAS</h2>
            <Link href="/alerts" className="text-[13px] text-[var(--ds-neutral-500)] underline">
              Ver todas
            </Link>
          </div>
          <Card>
            {data.activeAlerts.length === 0 ? (
              <p className="text-[15px] text-[var(--ds-neutral-600)]">No hay alertas activas.</p>
            ) : (
              <ul className="divide-y divide-[var(--ds-neutral-100)]">
                {data.activeAlerts.map((a) => (
                  <li key={a.id} className="py-[12px] first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-[8px]">
                      <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{a.title}</p>
                      <Badge tone={a.severity === 'urgent' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}>{a.severity}</Badge>
                    </div>
                    <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">{a.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-[24px] lg:grid-cols-2">
        <div>
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">PRESUPUESTOS CERCA DEL LIMITE</h2>
            <Link href="/budgets" className="text-[13px] text-[var(--ds-neutral-500)] underline">
              Ver todos
            </Link>
          </div>
          <Card>
            {data.budgetsCloseToLimit.length === 0 ? (
              <p className="text-[15px] text-[var(--ds-neutral-600)]">No hay presupuestos definidos este mes.</p>
            ) : (
              <ul className="divide-y divide-[var(--ds-neutral-100)]">
                {data.budgetsCloseToLimit.map(({ budget, categoryName, percentageUsed }) => (
                  <li key={budget.id} className="flex items-center justify-between py-[8px] text-[15px] text-[var(--ds-neutral-900)] first:pt-0 last:pb-0">
                    <span>{categoryName}</span>
                    <span className="tabular-nums text-[var(--ds-neutral-600)]">{percentageUsed.toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">PROGRESO DE AHORROS</h2>
            <Link href="/savings" className="text-[13px] text-[var(--ds-neutral-500)] underline">
              Ver todos
            </Link>
          </div>
          <Card>
            {data.savingsGoals.length === 0 ? (
              <p className="text-[15px] text-[var(--ds-neutral-600)]">No tienes metas de ahorro activas.</p>
            ) : (
              <ul className="divide-y divide-[var(--ds-neutral-100)]">
                {data.savingsGoals.map((g) => (
                  <li key={g.id} className="py-[8px] first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[15px] text-[var(--ds-neutral-900)]">
                      <span>{g.name}</span>
                      <span className="tabular-nums text-[var(--ds-neutral-600)]">
                        {(savingsProgressRatio(g.current_amount_minor, g.target_amount_minor) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
