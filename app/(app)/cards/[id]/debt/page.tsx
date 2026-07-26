import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { getCard, getCardDebtContext, listCards } from '@/features/cards/queries';
import { creditUtilization } from '@/lib/finance/credit';
import { nextMonthlyDayOccurrence } from '@/lib/finance/dates';
import { classifyDebtStatus, interestPressure } from '@/lib/finance/debt-status';
import { computeMinimumPayment, estimateBalanceForInterest, estimateCycleInterest, paymentToAvoidInterest, simulatePayoff } from '@/lib/finance/interest';
import { buildCardInsights } from '@/lib/finance/debt-insights';
import { formatDateGT } from '@/lib/dates/format';
import { addMonths } from 'date-fns';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { Meter } from '@/components/design-system/Meter';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/design-system/Icon';
import { DEBT_STATUS_META } from '@/components/finance/debt-status-meta';
import { PaymentSimulator } from './payment-simulator';
import { WhatIfSimulator } from './what-if-simulator';
import { Timeline } from './timeline';

const INTEREST_PRESSURE_LABEL: Record<string, string> = { low: 'Bajo', medium: 'Medio', high: 'Alto', critical: 'Critico' };
const INTEREST_PRESSURE_TONE: Record<string, 'success' | 'warning' | 'caution' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'caution',
  critical: 'danger',
};
const STATUS_TEXT_COLOR: Record<string, string> = {
  success: 'var(--ds-color-success-text)',
  warning: 'var(--ds-color-warning-text)',
  caution: 'var(--ds-color-caution-text)',
  danger: 'var(--ds-color-danger-text)',
  info: 'var(--ds-color-info-text)',
};

export default async function CardDebtAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const card = await getCard(user.id, id);
  if (!card) notFound();

  const [debtContext, allCards] = await Promise.all([getCardDebtContext(user.id, id), listCards(user.id)]);
  const activeCards = allCards.filter((c) => !c.is_archived);

  const today = new Date();
  const utilization = creditUtilization(card.current_balance_minor, card.credit_limit_minor);
  const available = card.credit_limit_minor - card.current_balance_minor;
  const aprPercent = card.annual_interest_rate ?? 0;

  const status = classifyDebtStatus(card, {
    hasActiveInstallmentPlan: debtContext.hasActiveInstallmentPlan,
    lastPaymentMinor: debtContext.lastPaymentMinor,
    lastPaymentDate: debtContext.lastPaymentDate,
    today,
  });
  const statusMeta = DEBT_STATUS_META[status];
  const pressure = interestPressure(utilization, status);

  const minimumPayment = computeMinimumPayment(card);
  const paymentDue = paymentToAvoidInterest(card);
  const estimatedInterest = estimateCycleInterest(estimateBalanceForInterest(card), aprPercent);
  const debtProgress =
    card.statement_balance_minor > 0
      ? Math.max(0, Math.min(100, (1 - card.current_balance_minor / card.statement_balance_minor) * 100))
      : card.current_balance_minor === 0
        ? 100
        : 0;

  const nextStatement = nextMonthlyDayOccurrence(today, card.statement_day);
  const nextPayment = nextMonthlyDayOccurrence(today, card.payment_due_day);

  const baselinePayoff = card.current_balance_minor > 0 ? simulatePayoff({ balanceMinor: card.current_balance_minor, aprPercent, monthlyPaymentMinor: minimumPayment }) : null;
  const projectedPayoffLabel =
    baselinePayoff == null
      ? 'Sin deuda'
      : baselinePayoff.neverPaysOff
        ? 'No calculable con el pago minimo actual'
        : formatDateGT(addMonths(today, baselinePayoff.months).toISOString().slice(0, 10));

  const insights = buildCardInsights(card, activeCards, status);

  return (
    <div className="space-y-[40px]">
      <section>
        <p className="text-[13px] text-[var(--ds-neutral-500)]">
          <Link href={`/cards/${card.id}`} className="hover:underline">
            {card.name}
          </Link>{' '}
          · Estado de deuda
        </p>
        <h1 className="font-display mt-[4px] text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Estado de deuda</h1>
        <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Saldo pendiente</p>
        <div className="mt-[4px]">
          <NumericDisplay amountMinor={card.current_balance_minor} currency={card.currency} size="display" />
        </div>
      </section>

      <section>
        <Card className="flex items-start gap-[12px]">
          <span className="mt-[2px]" style={{ color: STATUS_TEXT_COLOR[statusMeta.tone] }}>
            <Icon icon={statusMeta.icon} />
          </span>
          <div>
            <p className="text-[15px] font-medium" style={{ color: STATUS_TEXT_COLOR[statusMeta.tone] }}>
              {statusMeta.label}
            </p>
            <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-600)]">{statusMeta.explanation}</p>
            <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-900)]">Accion recomendada: {statusMeta.action}</p>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">INDICADORES</h2>
        <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
          <Card>
            <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Utilizacion</p>
            <p className="font-display mt-[4px] text-[22px] font-medium text-[var(--ds-neutral-900)]">{utilization.toFixed(0)}%</p>
            <Meter className="mt-[8px]" value={utilization} tone={utilization >= 75 ? 'danger' : utilization >= 30 ? 'warning' : 'success'} />
          </Card>
          <Card>
            <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Progreso de la deuda</p>
            <p className="font-display mt-[4px] text-[22px] font-medium text-[var(--ds-neutral-900)]">{debtProgress.toFixed(0)}%</p>
            <Meter className="mt-[8px]" value={debtProgress} tone="success" />
          </Card>
          <Card>
            <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Presion de interes</p>
            <p className="mt-[4px]">
              <Badge tone={INTEREST_PRESSURE_TONE[pressure]}>{INTEREST_PRESSURE_LABEL[pressure]}</Badge>
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">ESTADO ACTUAL</h2>
        <Card>
          <dl className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Saldo actual"><NumericDisplay amountMinor={card.current_balance_minor} currency={card.currency} size="numericBody" /></Field>
            <Field label="Saldo de estado de cuenta"><NumericDisplay amountMinor={card.statement_balance_minor} currency={card.currency} size="numericBody" /></Field>
            <Field label="Limite de credito"><NumericDisplay amountMinor={card.credit_limit_minor} currency={card.currency} size="numericBody" /></Field>
            <Field label="Credito disponible"><NumericDisplay amountMinor={available} currency={card.currency} size="numericBody" /></Field>
            <Field label="Utilizacion"><span className="text-[15px] font-medium tabular-nums text-[var(--ds-neutral-900)]">{utilization.toFixed(0)}%</span></Field>
            <Field label="Fecha de corte"><span className="text-[15px] text-[var(--ds-neutral-900)]">{formatDateGT(nextStatement.toISOString().slice(0, 10))}</span></Field>
            <Field label="Fecha limite de pago"><span className="text-[15px] text-[var(--ds-neutral-900)]">{formatDateGT(nextPayment.toISOString().slice(0, 10))}</span></Field>
            <Field label="Pago minimo"><NumericDisplay amountMinor={minimumPayment} currency={card.currency} size="numericBody" /></Field>
            <Field label="Pago para evitar intereses"><NumericDisplay amountMinor={paymentDue} currency={card.currency} size="numericBody" /></Field>
            <Field label="Tasa de interes (APR)"><span className="text-[15px] tabular-nums text-[var(--ds-neutral-900)]">{aprPercent ? `${aprPercent}%` : 'No registrada'}</span></Field>
            <Field label="Tipo de interes">
              <span className="text-[15px] text-[var(--ds-neutral-900)]">
                {card.interest_calculation_method === 'average_daily_balance' ? 'Promedio diario (aproximado)' : 'Saldo de estado de cuenta'}
              </span>
            </Field>
            <Field label="Interes estimado del proximo ciclo"><NumericDisplay amountMinor={estimatedInterest} currency={card.currency} size="numericBody" /></Field>
            <Field label="Ultimo pago">
              {debtContext.lastPaymentDate && debtContext.lastPaymentMinor != null ? (
                <span className="text-[15px] text-[var(--ds-neutral-900)]">
                  {formatDateGT(debtContext.lastPaymentDate)} · <NumericDisplay amountMinor={debtContext.lastPaymentMinor} currency={card.currency} size="small" className="inline" />
                </span>
              ) : (
                <span className="text-[15px] text-[var(--ds-neutral-500)]">Sin pagos registrados</span>
              )}
            </Field>
            <Field label="Proximo pago"><span className="text-[15px] text-[var(--ds-neutral-900)]">{formatDateGT(nextPayment.toISOString().slice(0, 10))}</span></Field>
          </dl>
          <p className="mt-[16px] text-[12px] text-[var(--ds-neutral-400)]">
            El interes es una estimacion basada en tus datos registrados. Tu estado de cuenta es el valor oficial.
          </p>
        </Card>
      </section>

      {card.current_balance_minor > 0 && (
        <>
          <section>
            <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">SIMULADOR DE PAGOS</h2>
            <PaymentSimulator balanceMinor={card.current_balance_minor} aprPercent={aprPercent} currency={card.currency} defaultPaymentMinor={minimumPayment} />
          </section>

          <section>
            <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">ESCENARIOS</h2>
            <WhatIfSimulator
              balanceMinor={card.current_balance_minor}
              creditLimitMinor={card.credit_limit_minor}
              aprPercent={aprPercent}
              currency={card.currency}
              monthlyPaymentMinor={minimumPayment}
            />
          </section>

          <section>
            <Timeline
              steps={[
                { label: 'Hoy', date: formatDateGT(today.toISOString().slice(0, 10)) },
                { label: 'Proximo corte', date: formatDateGT(nextStatement.toISOString().slice(0, 10)) },
                { label: 'Fecha limite de pago', date: formatDateGT(nextPayment.toISOString().slice(0, 10)) },
                { label: 'Pago proyectado', date: projectedPayoffLabel },
              ]}
            />
          </section>
        </>
      )}

      {insights.length > 0 && (
        <section>
          <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">INSIGHTS</h2>
          <Card>
            <ul className="space-y-[8px]">
              {insights.map((insight) => (
                <li key={insight} className="text-[14px] text-[var(--ds-neutral-800)]">
                  · {insight}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] font-medium text-[var(--ds-neutral-500)]">{label}</dt>
      <dd className="mt-[4px]">{children}</dd>
    </div>
  );
}
