import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getCard, listCardTransactions } from '@/features/cards/queries';
import { listAccounts } from '@/features/accounts/queries';
import { creditUtilization } from '@/lib/finance/credit';
import { nextMonthlyDayOccurrence } from '@/lib/finance/dates';
import { formatDateGT } from '@/lib/dates/format';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { TransactionCard } from '@/components/design-system/Cards';
import { Card } from '@/components/ui/card';
import { Workspace, ContextSection } from '@/components/layout/workspace';
import { StaggerList, StaggerItem } from '@/components/design-system/Stagger';
import { CardDetailActions } from './card-detail-actions';

function utilizationTone(pct: number): 'neutral' | 'negative' {
  return pct >= 75 ? 'negative' : 'neutral';
}

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const card = await getCard(user.id, id);
  if (!card) notFound();

  const [transactions, accounts] = await Promise.all([listCardTransactions(user.id, id), listAccounts(user.id)]);
  const utilization = creditUtilization(card.current_balance_minor, card.credit_limit_minor);
  const available = card.credit_limit_minor - card.current_balance_minor;
  const today = new Date();
  const nextStatement = nextMonthlyDayOccurrence(today, card.statement_day);
  const nextPayment = nextMonthlyDayOccurrence(today, card.payment_due_day);
  const activeAccounts = accounts.filter((a) => !a.is_archived);

  return (
    <Workspace
      context={
        <>
          <ContextSection title="Utilizacion">
            <div className="font-display mt-[4px] text-[34px] font-medium leading-[40px] tracking-[-0.02em] text-[var(--ds-neutral-900)]">
              {utilization.toFixed(0)}%
            </div>
            <div className="mt-[8px] h-[6px] w-full rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)]">
              <div
                className="h-[6px] rounded-[var(--ds-radius-pill)] transition-[width] duration-[var(--ds-duration-base)]"
                style={{
                  width: `${Math.min(utilization, 100)}%`,
                  backgroundColor: utilization >= 75 ? 'var(--ds-color-danger)' : utilization >= 30 ? 'var(--ds-color-warning)' : 'var(--ds-color-success)',
                }}
              />
            </div>
            <p className="mt-[8px] text-[13px] text-[var(--ds-neutral-500)]">
              Disponible <NumericDisplay amountMinor={available} currency={card.currency} size="small" className="inline" />
            </p>
          </ContextSection>

          <ContextSection title="Fechas clave">
            <Card className="space-y-[12px]">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--ds-neutral-500)]">Proximo corte</span>
                <span className="text-[var(--ds-neutral-900)]">{formatDateGT(nextStatement.toISOString().slice(0, 10))}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--ds-neutral-100)] pt-[12px] text-[13px]">
                <span className="text-[var(--ds-neutral-500)]">Proximo pago</span>
                <span className="text-[var(--ds-neutral-900)]">{formatDateGT(nextPayment.toISOString().slice(0, 10))}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--ds-neutral-100)] pt-[12px] text-[13px]">
                <span className="text-[var(--ds-neutral-500)]">Limite de credito</span>
                <NumericDisplay amountMinor={card.credit_limit_minor} currency={card.currency} size="small" />
              </div>
            </Card>
          </ContextSection>
        </>
      }
    >
      <div className="space-y-[40px]">
        <section>
          <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">{card.name}</h1>
          <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">
            {card.institution_name ?? 'Sin institucion'}
            {card.last_four ? ` · ****${card.last_four}` : ''}
          </p>
          <p className="mt-[16px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Saldo actual</p>
          <div className="mt-[4px]">
            <NumericDisplay
              amountMinor={card.current_balance_minor}
              currency={card.currency}
              size="display"
              tone={utilizationTone(utilization)}
            />
          </div>
          <div className="mt-[20px]">
            <CardDetailActions card={card} accounts={activeAccounts} />
          </div>
        </section>

        <section>
          <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">
            MOVIMIENTOS RECIENTES
          </h2>
          {transactions.length === 0 ? (
            <Card>
              <p className="text-[15px] text-[var(--ds-neutral-600)]">Sin movimientos todavia.</p>
            </Card>
          ) : (
            <StaggerList className="space-y-[8px]">
              {transactions.map((t) => {
                const type =
                  t.transaction_type === 'income' || t.transaction_type === 'refund'
                    ? 'income'
                    : t.transaction_type === 'credit_card_payment'
                      ? 'transfer'
                      : 'expense';
                return (
                  <StaggerItem key={t.id}>
                    <TransactionCard type={type} description={t.description} date={formatDateGT(t.transaction_date)} amountMinor={t.amount_minor} currency={card.currency} />
                  </StaggerItem>
                );
              })}
            </StaggerList>
          )}
        </section>
      </div>
    </Workspace>
  );
}
