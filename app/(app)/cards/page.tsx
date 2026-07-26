import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listCards } from '@/features/cards/queries';
import { formatCurrency } from '@/lib/finance/money';
import { creditUtilization } from '@/lib/finance/credit';
import { nextMonthlyDayOccurrence } from '@/lib/finance/dates';
import { formatDateGT } from '@/lib/dates/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tarjetas</h1>
        <NewCardButton />
      </div>

      {active.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">Aun no tienes tarjetas registradas.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((card) => {
            const utilization = creditUtilization(card.current_balance_minor, card.credit_limit_minor);
            const available = card.credit_limit_minor - card.current_balance_minor;
            const nextStatement = nextMonthlyDayOccurrence(today, card.statement_day);
            const nextPayment = nextMonthlyDayOccurrence(today, card.payment_due_day);

            return (
              <Link key={card.id} href={`/cards/${card.id}`}>
                <Card className="h-full hover:border-slate-400">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{card.name}</p>
                      <p className="text-xs text-slate-500">
                        {card.institution_name ?? 'Sin institucion'}
                        {card.last_four ? ` · ****${card.last_four}` : ''}
                      </p>
                    </div>
                    <Badge tone={utilizationTone(utilization)}>{utilization.toFixed(0)}% usado</Badge>
                  </div>
                  <p className="mt-3 text-lg font-semibold">{formatCurrency(card.current_balance_minor, card.currency)}</p>
                  <p className="text-xs text-slate-500">Disponible: {formatCurrency(available, card.currency)}</p>
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>Corte: {formatDateGT(nextStatement.toISOString().slice(0, 10))}</span>
                    <span>Pago: {formatDateGT(nextPayment.toISOString().slice(0, 10))}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500">Tarjetas archivadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((card) => (
              <Card key={card.id} className="opacity-60">
                <p className="font-medium">{card.name}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
