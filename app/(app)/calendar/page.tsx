import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { generateOccurrencesForUser } from '@/features/obligations/actions';
import { listCalendarEvents, type CalendarEventType } from '@/features/calendar/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT, monthLabel } from '@/lib/dates/format';
import { Badge } from '@/components/ui/badge';

const TYPE_LABELS: Record<CalendarEventType, string> = {
  obligation: 'Obligacion',
  card_statement: 'Corte de tarjeta',
  card_payment: 'Pago de tarjeta',
  expected_income: 'Ingreso esperado',
};

const TYPE_TONE: Record<CalendarEventType, 'info' | 'warning' | 'danger' | 'success'> = {
  obligation: 'warning',
  card_statement: 'info',
  card_payment: 'danger',
  expected_income: 'success',
};

function monthBounds(monthParam: string | undefined) {
  const base = monthParam ? `${monthParam}-01` : new Date().toISOString().slice(0, 7) + '-01';
  const [y, m] = base.split('-').map(Number);
  const start = new Date(Date.UTC(y!, m! - 1, 1));
  const end = new Date(Date.UTC(y!, m!, 0));
  return { start, end };
}

function adjacentMonth(monthParam: string | undefined, delta: number): string {
  const { start } = monthBounds(monthParam);
  const next = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + delta, 1));
  return next.toISOString().slice(0, 7);
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; view?: string }> }) {
  const { month, view } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  await generateOccurrencesForUser(user.id);

  const { start, end } = monthBounds(month);
  const events = await listCalendarEvents(user.id, start, end);
  const eventsByDate = new Map<string, typeof events>();
  for (const ev of events) {
    const list = eventsByDate.get(ev.date) ?? [];
    list.push(ev);
    eventsByDate.set(ev.date, list);
  }

  const currentMonth = start.toISOString().slice(0, 7);
  const isAgenda = view === 'agenda';

  const days: Date[] = [];
  const leadingBlank = start.getUTCDay();
  for (let i = 0; i < end.getUTCDate(); i++) {
    days.push(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), i + 1)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold capitalize">{monthLabel(currentMonth + '-01')}</h1>
        <div className="flex gap-2 text-sm">
          <Link href={`/calendar?month=${adjacentMonth(month, -1)}&view=${view ?? ''}`} className="rounded-md border border-[var(--ds-neutral-300)] px-3 py-1.5">
            ← Anterior
          </Link>
          <Link href={`/calendar?month=${adjacentMonth(month, 1)}&view=${view ?? ''}`} className="rounded-md border border-[var(--ds-neutral-300)] px-3 py-1.5">
            Siguiente →
          </Link>
          <Link href={`/calendar?month=${currentMonth}&view=${isAgenda ? '' : 'agenda'}`} className="rounded-md border border-[var(--ds-neutral-300)] px-3 py-1.5">
            {isAgenda ? 'Ver mes' : 'Ver agenda'}
          </Link>
        </div>
      </div>

      {!isAgenda ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-lg border border-[var(--ds-neutral-200)] bg-[var(--ds-neutral-200)] text-xs">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((d) => (
              <div key={d} className="bg-[var(--ds-neutral-50)] px-2 py-1 text-center font-medium text-[var(--ds-neutral-500)]">
                {d}
              </div>
            ))}
            {Array.from({ length: leadingBlank }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-24 bg-[var(--ds-color-surface)]" />
            ))}
            {days.map((day) => {
              const iso = day.toISOString().slice(0, 10);
              const dayEvents = eventsByDate.get(iso) ?? [];
              return (
                <div key={iso} className="min-h-24 bg-[var(--ds-color-surface)] p-1">
                  <p className="text-right text-[var(--ds-neutral-400)]">{day.getUTCDate()}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="truncate rounded bg-[var(--ds-neutral-100)] px-1 py-0.5" title={ev.title}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <p className="text-[var(--ds-neutral-400)]">+{dayEvents.length - 3} mas</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--ds-neutral-200)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--ds-neutral-50)] text-left text-xs uppercase text-[var(--ds-neutral-500)]">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Evento</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--ds-neutral-500)]">
                    No hay eventos este mes.
                  </td>
                </tr>
              )}
              {events.map((ev) => (
                <tr key={ev.id} className="border-t border-[var(--ds-neutral-100)]">
                  <td className="px-4 py-2">{formatDateGT(ev.date)}</td>
                  <td className="px-4 py-2">{ev.title}</td>
                  <td className="px-4 py-2">
                    <Badge tone={TYPE_TONE[ev.type]}>{TYPE_LABELS[ev.type]}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ev.amountMinor, ev.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
