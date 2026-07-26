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

  const totalUpcoming60 = occurrences.reduce((s, o) => s + o.expected_amount_minor, 0);

  return (
    <div className="space-y-[32px]">
      <section>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Obligaciones recurrentes</h1>
        <p className="mt-[8px] text-[15px] text-[var(--ds-neutral-600)]">
          {occurrences.length === 0
            ? 'No hay ocurrencias proximas en los siguientes 60 dias.'
            : `${formatCurrency(totalUpcoming60)} en compromisos durante los proximos 60 dias.`}
        </p>
        <div className="mt-[20px]">
          <NewObligationButton accounts={activeAccounts} cards={activeCards} categories={categories} />
        </div>
      </section>

      <section>
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">OBLIGACIONES ACTIVAS</h2>
        {obligations.length === 0 ? (
          <Card>
            <p className="text-[15px] text-[var(--ds-neutral-600)]">Aun no tienes obligaciones registradas.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)]">
            <table className="w-full text-[13px]">
              <thead className="text-left text-[12px] uppercase tracking-[0.02em] text-[var(--ds-neutral-500)]">
                <tr>
                  <th className="px-[16px] py-[8px]">Nombre</th>
                  <th className="px-[16px] py-[8px]">Proximo vencimiento</th>
                  <th className="px-[16px] py-[8px]">Monto</th>
                  <th className="px-[16px] py-[8px]">Frecuencia</th>
                  <th className="px-[16px] py-[8px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {obligations.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--ds-neutral-100)]">
                    <td className="px-[16px] py-[8px]">{o.name}</td>
                    <td className="px-[16px] py-[8px]">{formatDateGT(o.next_due_date)}</td>
                    <td className="px-[16px] py-[8px]">{formatCurrency(o.amount_minor, o.currency)}</td>
                    <td className="px-[16px] py-[8px]">{FREQUENCY_LABELS[o.frequency]}</td>
                    <td className="px-[16px] py-[8px]">
                      <Badge tone={o.is_active ? 'success' : 'neutral'}>{o.is_active ? 'Activa' : 'Pausada'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">PROXIMAS OCURRENCIAS (60 DIAS)</h2>
        {occurrences.length === 0 ? (
          <Card>
            <p className="text-[15px] text-[var(--ds-neutral-600)]">No hay ocurrencias proximas.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)]">
            <table className="w-full text-[13px]">
              <thead className="text-left text-[12px] uppercase tracking-[0.02em] text-[var(--ds-neutral-500)]">
                <tr>
                  <th className="px-[16px] py-[8px]">Obligacion</th>
                  <th className="px-[16px] py-[8px]">Vence</th>
                  <th className="px-[16px] py-[8px]">Monto esperado</th>
                  <th className="px-[16px] py-[8px]">Estado</th>
                  <th className="px-[16px] py-[8px]">Accion</th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((occ) => {
                  const obligation = obligationsById.get(occ.recurring_obligation_id);
                  return (
                    <tr key={occ.id} className="border-t border-[var(--ds-neutral-100)]">
                      <td className="px-[16px] py-[8px]">{obligation?.name ?? 'Obligacion'}</td>
                      <td className="px-[16px] py-[8px]">{formatDateGT(occ.due_date)}</td>
                      <td className="px-[16px] py-[8px]">{formatCurrency(occ.expected_amount_minor, obligation?.currency ?? 'GTQ')}</td>
                      <td className="px-[16px] py-[8px]">
                        <Badge tone={STATUS_TONE[occ.status]}>{occ.status}</Badge>
                      </td>
                      <td className="px-[16px] py-[8px]">
                        <OccurrenceActions occurrence={occ} accounts={activeAccounts} cards={activeCards} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
