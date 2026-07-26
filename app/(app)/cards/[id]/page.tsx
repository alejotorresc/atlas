import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getCard, listCardTransactions } from '@/features/cards/queries';
import { listAccounts } from '@/features/accounts/queries';
import { formatCurrency } from '@/lib/finance/money';
import { creditUtilization } from '@/lib/finance/credit';
import { nextMonthlyDayOccurrence } from '@/lib/finance/dates';
import { formatDateGT } from '@/lib/dates/format';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { CardDetailActions } from './card-detail-actions';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{card.name}</h1>
        <p className="text-sm text-[var(--ds-neutral-500)]">
          {card.institution_name ?? 'Sin institucion'}
          {card.last_four ? ` · ****${card.last_four}` : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle>Saldo actual</CardTitle>
          <CardValue>{formatCurrency(card.current_balance_minor, card.currency)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Disponible</CardTitle>
          <CardValue>{formatCurrency(available, card.currency)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Utilizacion</CardTitle>
          <CardValue>{utilization.toFixed(0)}%</CardValue>
        </Card>
        <Card>
          <CardTitle>Limite</CardTitle>
          <CardValue>{formatCurrency(card.credit_limit_minor, card.currency)}</CardValue>
        </Card>
      </div>

      <div className="flex gap-6 text-sm text-[var(--ds-neutral-600)]">
        <span>Proximo corte: {formatDateGT(nextStatement.toISOString().slice(0, 10))}</span>
        <span>Proximo pago: {formatDateGT(nextPayment.toISOString().slice(0, 10))}</span>
      </div>

      <CardDetailActions card={card} accounts={activeAccounts} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Movimientos recientes</h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--ds-neutral-200)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--ds-neutral-50)] text-left text-xs uppercase text-[var(--ds-neutral-500)]">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Descripcion</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[var(--ds-neutral-500)]">
                    Sin movimientos todavia.
                  </td>
                </tr>
              )}
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-[var(--ds-neutral-100)]">
                  <td className="px-4 py-2">{formatDateGT(t.transaction_date)}</td>
                  <td className="px-4 py-2">{t.description}</td>
                  <td className="px-4 py-2">{t.transaction_type}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(t.amount_minor, card.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
