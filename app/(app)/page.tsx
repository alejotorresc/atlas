import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase/server';
import { getDashboardData } from '@/features/dashboard/queries';
import { refreshAlerts } from '@/features/alerts/actions';
import { formatDateGT } from '@/lib/dates/format';
import { savingsProgressRatio } from '@/lib/finance/savings-pace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/design-system/Icon';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { AccountCard, AlertCard, BudgetCard, CalendarEventCard, SavingsCard, TransactionCard } from '@/components/design-system/Cards';

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

  const isNegative = data.safeToSpend.safeToSpendMinor < 0;
  const hasUrgentAlert = data.activeAlerts.some((a) => a.severity === 'urgent');

  let statusLine: string;
  if (isNegative) {
    statusLine = 'Tus compromisos superan lo disponible. Revisa tus obligaciones antes de gastar.';
  } else if (hasUrgentAlert) {
    statusLine = 'Hay algo que necesita tu atencion antes de seguir.';
  } else if (data.nextCommitment) {
    statusLine =
      data.nextCommitment.daysUntil === 0
        ? `Tu proximo compromiso vence hoy: ${data.nextCommitment.name}.`
        : `Todo esta bajo control. Tu proximo compromiso es en ${data.nextCommitment.daysUntil} dias.`;
  } else {
    statusLine = 'Todo esta bajo control. No tienes compromisos proximos.';
  }

  return (
    <div className="space-y-[56px]">
      {/* Hero */}
      <section>
        <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Disponible para gastar</p>
        <div className="mt-[8px]">
          <NumericDisplay amountMinor={data.safeToSpend.safeToSpendMinor} size="display" tone={isNegative ? 'negative' : 'neutral'} />
        </div>
        <p className="mt-[12px] max-w-[46ch] text-[15px] text-[var(--ds-neutral-600)]">{statusLine}</p>
        <div className="mt-[20px] flex items-center gap-[12px]">
          <Link href="/transactions?new=1">
            <Button variant="primary">Registrar movimiento</Button>
          </Link>
          {(isNegative || hasUrgentAlert) && (
            <Link href="/alerts" className="text-[13px] font-medium text-[var(--ds-color-primary)]">
              Ver que requiere atencion →
            </Link>
          )}
        </div>
      </section>

      {/* Upcoming commitments */}
      <section>
        <SectionHeader title="Proximos compromisos" href="/calendar" />
        {data.activeAlerts.length === 0 && !data.nextCommitment ? (
          <EmptyRow text="No tienes compromisos proximos registrados." />
        ) : (
          <div className="space-y-[8px]">
            {data.nextCommitment && (
              <CalendarEventCard
                date={formatDateGT(data.nextCommitment.dueDate)}
                title={data.nextCommitment.name}
                amountMinor={data.nextCommitment.amountMinor}
              />
            )}
            {data.activeAlerts.slice(0, 3).map((a) => (
              <AlertCard
                key={a.id}
                tone={a.severity === 'urgent' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}
                title={a.title}
                message={a.message}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <SectionHeader title="Actividad reciente" href="/transactions" />
        {data.recentTransactions.length === 0 ? (
          <EmptyRow text="Sin movimientos todavia." />
        ) : (
          <div className="space-y-[8px]">
            {data.recentTransactions.slice(0, 5).map((t) => {
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
      </section>

      {/* Accounts */}
      <section>
        <SectionHeader title="Cuentas" href="/accounts" />
        <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {data.accounts.map((a) => (
            <Link key={a.id} href={`/accounts/${a.id}`}>
              <AccountCard name={a.name} institution={a.institution_name ?? ''} balanceMinor={a.current_balance_minor} currency={a.currency} />
            </Link>
          ))}
        </div>
      </section>

      {/* Monthly progress */}
      <section>
        <SectionHeader title="Progreso del mes" href="/budgets" />
        <div className="grid gap-[12px] sm:grid-cols-2">
          {data.budgetsCloseToLimit.length === 0 ? (
            <EmptyRow text="No hay presupuestos definidos este mes." />
          ) : (
            data.budgetsCloseToLimit.slice(0, 4).map(({ budget, categoryName, spentMinor }) => (
              <BudgetCard
                key={budget.id}
                category={categoryName}
                spentMinor={spentMinor}
                budgetMinor={budget.budget_amount_minor}
              />
            ))
          )}
          {data.savingsGoals.slice(0, 2).map((g) => (
            <SavingsCard
              key={g.id}
              name={g.name}
              currentMinor={g.current_amount_minor}
              targetMinor={g.target_amount_minor}
              currency={g.currency}
              paceLabel={`${(savingsProgressRatio(g.current_amount_minor, g.target_amount_minor) * 100).toFixed(0)}% alcanzado`}
            />
          ))}
        </div>
      </section>

      {/* Reports */}
      <section>
        <Link
          href="/reports"
          className="flex items-center justify-between rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] px-[20px] py-[16px] text-[15px] text-[var(--ds-neutral-700)] hover:bg-[var(--ds-neutral-50)]"
        >
          Ver reportes y tendencias del mes
          <Icon icon={ArrowRight} size="sm" className="text-[var(--ds-neutral-400)]" />
        </Link>
      </section>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-[12px] flex items-center justify-between">
      <h2 className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">{title.toUpperCase()}</h2>
      <Link href={href} className="text-[13px] text-[var(--ds-neutral-500)] hover:text-[var(--ds-color-primary)]">
        Ver todo
      </Link>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <Card>
      <p className="text-[15px] text-[var(--ds-neutral-600)]">{text}</p>
    </Card>
  );
}
