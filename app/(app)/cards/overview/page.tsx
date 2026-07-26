import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listCards, listCardsDebtContext } from '@/features/cards/queries';
import { totalCreditCardDebt } from '@/lib/finance/balances';
import { creditUtilization } from '@/lib/finance/credit';
import { classifyDebtStatus } from '@/lib/finance/debt-status';
import { computeMinimumPayment, estimateBalanceForInterest, estimateCycleInterest } from '@/lib/finance/interest';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { DEBT_STATUS_META } from '@/components/finance/debt-status-meta';

export default async function DebtOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cards = (await listCards(user.id)).filter((c) => !c.is_archived);
  const contexts = await listCardsDebtContext(user.id, cards.map((c) => c.id));
  const today = new Date();

  const rows = cards.map((card) => {
    const ctx = contexts.get(card.id) ?? { hasActiveInstallmentPlan: false, lastPaymentMinor: null, lastPaymentDate: null };
    const status = classifyDebtStatus(card, { ...ctx, today });
    const utilization = creditUtilization(card.current_balance_minor, card.credit_limit_minor);
    const aprPercent = card.annual_interest_rate ?? 0;
    const estimatedInterest = estimateCycleInterest(estimateBalanceForInterest(card), aprPercent);
    const minimumPayment = computeMinimumPayment(card);
    return { card, status, utilization, aprPercent, estimatedInterest, minimumPayment };
  });

  const totalDebt = totalCreditCardDebt(cards);
  const withDebt = rows.filter((r) => r.card.current_balance_minor > 0);
  const averageUtilization = rows.length ? rows.reduce((sum, r) => sum + r.utilization, 0) / rows.length : 0;
  const weightedAprSum = withDebt.reduce((sum, r) => sum + r.aprPercent * r.card.current_balance_minor, 0);
  const averageApr = totalDebt > 0 ? weightedAprSum / totalDebt : 0;
  const generatingInterestCount = rows.filter((r) => r.card.current_balance_minor > 0 && r.status !== 'current').length;
  const paidInFullCount = rows.filter((r) => r.card.current_balance_minor === 0).length;
  const totalEstimatedInterest = rows.reduce((sum, r) => sum + r.estimatedInterest, 0);
  const totalMinimumPayments = rows.reduce((sum, r) => sum + r.minimumPayment, 0);
  const highestPriority = withDebt.slice().sort((a, b) => b.aprPercent - a.aprPercent || b.utilization - a.utilization)[0];

  return (
    <div className="space-y-[40px]">
      <section>
        <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Resumen de deuda</h1>
        <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Deuda total en tarjetas</p>
        <div className="mt-[4px]">
          <NumericDisplay amountMinor={totalDebt} size="display" />
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Utilizacion promedio" value={`${averageUtilization.toFixed(0)}%`} />
          <Stat label="Tasa de interes promedio" value={averageApr > 0 ? `${averageApr.toFixed(1)}%` : 'N/A'} />
          <Stat label="Tarjetas generando interes" value={String(generatingInterestCount)} />
          <Stat label="Tarjetas pagadas en su totalidad" value={String(paidInFullCount)} />
          <Stat label="Interes mensual estimado"><NumericDisplay amountMinor={totalEstimatedInterest} size="numericDisplay" /></Stat>
          <Stat label="Total de pagos minimos"><NumericDisplay amountMinor={totalMinimumPayments} size="numericDisplay" /></Stat>
          <Stat label="Deuda de mayor prioridad">
            {highestPriority ? (
              <Link href={`/cards/${highestPriority.card.id}/debt`} className="text-[15px] font-medium text-[var(--ds-color-primary)] hover:underline">
                {highestPriority.card.name} ({highestPriority.aprPercent}% APR)
              </Link>
            ) : (
              <span className="text-[15px] text-[var(--ds-neutral-500)]">Sin deudas activas</span>
            )}
          </Stat>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">TARJETAS</h2>
        {rows.length === 0 ? (
          <Card>
            <p className="text-[15px] text-[var(--ds-neutral-600)]">Aun no tienes tarjetas registradas.</p>
          </Card>
        ) : (
          <div className="space-y-[8px]">
            {rows.map(({ card, status, utilization }) => {
              const meta = DEBT_STATUS_META[status];
              return (
                <Link key={card.id} href={`/cards/${card.id}/debt`}>
                  <Card state="interactive" className="flex flex-wrap items-center justify-between gap-[12px]">
                    <div>
                      <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{card.name}</p>
                      <p className="text-[13px] text-[var(--ds-neutral-500)]">Utilizacion {utilization.toFixed(0)}%</p>
                    </div>
                    <div className="flex items-center gap-[16px]">
                      <NumericDisplay amountMinor={card.current_balance_minor} currency={card.currency} size="numericBody" />
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <Card>
      <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">{label}</p>
      <div className="mt-[4px]">
        {value != null ? <p className="font-display text-[22px] font-medium text-[var(--ds-neutral-900)]">{value}</p> : children}
      </div>
    </Card>
  );
}
