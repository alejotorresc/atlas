import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listCards } from '@/features/cards/queries';
import { totalCreditCardDebt } from '@/lib/finance/balances';
import { creditUtilization } from '@/lib/finance/credit';
import { nextMonthlyDayOccurrence } from '@/lib/finance/dates';
import { formatDateGT } from '@/lib/dates/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { NewCardButton } from './card-form';

function utilizationTone(pct: number): 'success' | 'warning' | 'danger' {
  if (pct >= 75) return 'danger';
  if (pct >= 30) return 'warning';
  return 'success';
}

export default async function CardsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cards = await listCards(user.id);
  const active = cards.filter((c) => !c.is_archived);
  const archived = cards.filter((c) => c.is_archived);
  const today = new Date();
  const totalDebt = totalCreditCardDebt(active);

  return (
    <div className="space-y-[40px]">
      <section>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Tarjetas</h1>
        <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Deuda total en tarjetas</p>
        <div className="mt-[4px]">
          <NumericDisplay amountMinor={totalDebt} size="display" />
        </div>
        <div className="mt-[20px]">
          <NewCardButton />
        </div>
      </section>

      <section>
        {active.length === 0 ? (
          <Card>
            <p className="text-[15px] text-[var(--ds-neutral-600)]">Aun no tienes tarjetas registradas.</p>
          </Card>
        ) : (
          <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {active.map((card) => {
              const utilization = creditUtilization(card.current_balance_minor, card.credit_limit_minor);
              const available = card.credit_limit_minor - card.current_balance_minor;
              const nextStatement = nextMonthlyDayOccurrence(today, card.statement_day);
              const nextPayment = nextMonthlyDayOccurrence(today, card.payment_due_day);

              return (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <Card state="interactive" className="h-full">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{card.name}</p>
                        <p className="text-[13px] text-[var(--ds-neutral-500)]">
                          {card.institution_name ?? 'Sin institucion'}
                          {card.last_four ? ` · ****${card.last_four}` : ''}
                        </p>
                      </div>
                      <Badge tone={utilizationTone(utilization)}>{utilization.toFixed(0)}% usado</Badge>
                    </div>
                    <div className="mt-[12px]">
                      <NumericDisplay amountMinor={card.current_balance_minor} currency={card.currency} size="numericBody" />
                    </div>
                    <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">
                      Disponible: <NumericDisplay amountMinor={available} currency={card.currency} size="small" className="inline" />
                    </p>
                    <div className="mt-[12px] flex justify-between text-[13px] text-[var(--ds-neutral-500)]">
                      <span>Corte: {formatDateGT(nextStatement.toISOString().slice(0, 10))}</span>
                      <span>Pago: {formatDateGT(nextPayment.toISOString().slice(0, 10))}</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section>
          <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">TARJETAS ARCHIVADAS</h2>
          <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((card) => (
              <Card key={card.id} className="opacity-60">
                <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{card.name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
