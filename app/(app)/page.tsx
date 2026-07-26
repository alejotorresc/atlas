import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { getDashboardData } from '@/features/dashboard/queries';
import { refreshAlerts } from '@/features/alerts/actions';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT } from '@/lib/dates/format';
import { savingsProgressRatio } from '@/lib/finance/savings-pace';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SafeToSpendCard } from '@/components/finance/safe-to-spend-card';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await refreshAlerts(user.id);
  const data = await getDashboardData(user.id);

  if (!data.hasAnyAccount) {
    return (
      <Card>
        <p className="mb-4 text-sm text-slate-600">
          Aun no tienes cuentas registradas. Crea tu primera cuenta para comenzar a ver tu panorama financiero.
        </p>
        <Link href="/accounts" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Crear cuenta
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inicio</h1>

      <SafeToSpendCard breakdown={data.safeToSpend} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle>Saldo total en cuentas</CardTitle>
          <CardValue>{formatCurrency(data.liquidBalance)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Deuda en tarjetas</CardTitle>
          <CardValue>{formatCurrency(data.creditCardDebt)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Posicion neta</CardTitle>
          <CardValue>{formatCurrency(data.netPosition)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Flujo neto del mes</CardTitle>
          <CardValue className={data.monthNetCashFlow < 0 ? 'text-red-600' : undefined}>{formatCurrency(data.monthNetCashFlow)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Ingresos del mes</CardTitle>
          <CardValue>{formatCurrency(data.monthIncome)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Gastos del mes</CardTitle>
          <CardValue>{formatCurrency(data.monthExpenses)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Proximo ingreso esperado</CardTitle>
          <CardValue>
            {data.nextExpectedIncome ? formatCurrency(data.nextExpectedIncome.amount_minor) : 'Sin datos'}
          </CardValue>
          {data.nextExpectedIncome && <p className="text-xs text-slate-500">{formatDateGT(data.nextExpectedIncome.transaction_date)}</p>}
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Obligaciones por vencer</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardTitle>7 dias</CardTitle>
            <CardValue>{formatCurrency(data.upcoming7)}</CardValue>
          </Card>
          <Card>
            <CardTitle>15 dias</CardTitle>
            <CardValue>{formatCurrency(data.upcoming15)}</CardValue>
          </Card>
          <Card>
            <CardTitle>30 dias</CardTitle>
            <CardValue>{formatCurrency(data.upcoming30)}</CardValue>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Movimientos recientes</h2>
            <Link href="/transactions" className="text-xs text-slate-500 underline">
              Ver todos
            </Link>
          </div>
          <Card>
            {data.recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-600">Sin movimientos todavia.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.recentTransactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p>{t.description}</p>
                      <p className="text-xs text-slate-500">{formatDateGT(t.transaction_date)}</p>
                    </div>
                    <span>{formatCurrency(t.amount_minor, t.currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Alertas activas</h2>
            <Link href="/alerts" className="text-xs text-slate-500 underline">
              Ver todas
            </Link>
          </div>
          <Card>
            {data.activeAlerts.length === 0 ? (
              <p className="text-sm text-slate-600">No hay alertas activas.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.activeAlerts.map((a) => (
                  <li key={a.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{a.title}</p>
                      <Badge tone={a.severity === 'urgent' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}>{a.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{a.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Presupuestos cerca del limite</h2>
            <Link href="/budgets" className="text-xs text-slate-500 underline">
              Ver todos
            </Link>
          </div>
          <Card>
            {data.budgetsCloseToLimit.length === 0 ? (
              <p className="text-sm text-slate-600">No hay presupuestos definidos este mes.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.budgetsCloseToLimit.map(({ budget, categoryName, percentageUsed }) => (
                  <li key={budget.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{categoryName}</span>
                    <span>{percentageUsed.toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Progreso de ahorros</h2>
            <Link href="/savings" className="text-xs text-slate-500 underline">
              Ver todos
            </Link>
          </div>
          <Card>
            {data.savingsGoals.length === 0 ? (
              <p className="text-sm text-slate-600">No tienes metas de ahorro activas.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.savingsGoals.map((g) => (
                  <li key={g.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{g.name}</span>
                      <span>{(savingsProgressRatio(g.current_amount_minor, g.target_amount_minor) * 100).toFixed(0)}%</span>
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
