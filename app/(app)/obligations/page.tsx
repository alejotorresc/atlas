import { getCurrentUser } from '@/lib/supabase/server';
import { generateOccurrencesForUser } from '@/features/obligations/actions';
import { listObligations, listUpcomingOccurrences } from '@/features/obligations/queries';
import { listAccounts } from '@/features/accounts/queries';
import { listCards } from '@/features/cards/queries';
import { listCategories } from '@/features/categories/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT } from '@/lib/dates/format';
import { addDaysUtc } from '@/lib/finance/dates';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewObligationButton } from './obligation-form';
import { OccurrenceActions } from './occurrence-actions';
import type { OccurrenceStatus } from '@/types/database';

const STATUS_TONE: Record<OccurrenceStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  upcoming: 'info',
  pending: 'warning',
  paid: 'success',
  partial: 'warning',
  overdue: 'danger',
  skipped: 'neutral',
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

export default async function ObligationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await generateOccurrencesForUser(user.id);

  const today = new Date();
  const horizon = addDaysUtc(today, 60).toISOString().slice(0, 10);
  const [obligations, occurrences, accounts, cards, categories] = await Promise.all([
    listObligations(user.id),
    listUpcomingOccurrences(user.id, today.toISOString().slice(0, 10), horizon),
    listAccounts(user.id),
    listCards(user.id),
    listCategories(user.id),
  ]);

  const obligationsById = new Map(obligations.map((o) => [o.id, o]));
  const activeAccounts = accounts.filter((a) => !a.is_archived);
  const activeCards = cards.filter((c) => !c.is_archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Obligaciones recurrentes</h1>
        <NewObligationButton accounts={activeAccounts} cards={activeCards} categories={categories} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Obligaciones activas</h2>
        {obligations.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--ds-neutral-600)]">Aun no tienes obligaciones registradas.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--ds-neutral-200)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--ds-neutral-50)] text-left text-xs uppercase text-[var(--ds-neutral-500)]">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Proximo vencimiento</th>
                  <th className="px-4 py-2">Monto</th>
                  <th className="px-4 py-2">Frecuencia</th>
                  <th className="px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {obligations.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--ds-neutral-100)]">
                    <td className="px-4 py-2">{o.name}</td>
                    <td className="px-4 py-2">{formatDateGT(o.next_due_date)}</td>
                    <td className="px-4 py-2">{formatCurrency(o.amount_minor, o.currency)}</td>
                    <td className="px-4 py-2">{FREQUENCY_LABELS[o.frequency]}</td>
                    <td className="px-4 py-2">
                      <Badge tone={o.is_active ? 'success' : 'neutral'}>{o.is_active ? 'Activa' : 'Pausada'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Proximas ocurrencias (60 dias)</h2>
        {occurrences.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--ds-neutral-600)]">No hay ocurrencias proximas.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--ds-neutral-200)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--ds-neutral-50)] text-left text-xs uppercase text-[var(--ds-neutral-500)]">
                <tr>
                  <th className="px-4 py-2">Obligacion</th>
                  <th className="px-4 py-2">Vence</th>
                  <th className="px-4 py-2">Monto esperado</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Accion</th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((occ) => {
                  const obligation = obligationsById.get(occ.recurring_obligation_id);
                  return (
                    <tr key={occ.id} className="border-t border-[var(--ds-neutral-100)]">
                      <td className="px-4 py-2">{obligation?.name ?? 'Obligacion'}</td>
                      <td className="px-4 py-2">{formatDateGT(occ.due_date)}</td>
                      <td className="px-4 py-2">{formatCurrency(occ.expected_amount_minor, obligation?.currency ?? 'GTQ')}</td>
                      <td className="px-4 py-2">
                        <Badge tone={STATUS_TONE[occ.status]}>{occ.status}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <OccurrenceActions occurrence={occ} accounts={activeAccounts} cards={activeCards} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
