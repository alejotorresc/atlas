import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { generateOccurrencesForUser } from '@/features/obligations/actions';
import { listCalendarEvents, type CalendarEventType } from '@/features/calendar/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT, monthLabel } from '@/lib/dates/format';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/design-system/Button';

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

  const monthTotal = events.reduce((s, ev) => s + ev.amountMinor, 0);

  return (
    <div className="space-y-[32px]">
      <section>
        <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)] capitalize">
          {monthLabel(currentMonth + '-01')}
        </h1>
        <p className="mt-[8px] text-[15px] text-[var(--ds-neutral-600)]">
          {events.length === 0 ? 'No hay compromisos este mes.' : `${events.length} eventos por ${formatCurrency(monthTotal)} en total.`}
        </p>
        <div className="mt-[20px] flex flex-wrap gap-[8px] text-[13px]">
          <Link
            href={`/calendar?month=${adjacentMonth(month, -1)}&view=${view ?? ''}`}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            ← Anterior
          </Link>
          <Link
            href={`/calendar?month=${adjacentMonth(month, 1)}&view=${view ?? ''}`}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Siguiente →
          </Link>
          <Link
            href={`/calendar?month=${currentMonth}&view=${isAgenda ? '' : 'agenda'}`}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            {isAgenda ? 'Ver mes' : 'Ver agenda'}
          </Link>
        </div>
      </section>

      {!isAgenda ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-7 gap-[1px] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] bg-[var(--ds-neutral-100)] text-[12px]">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((d) => (
              <div key={d} className="bg-[var(--ds-color-surface)] px-[8px] py-[6px] text-center font-medium text-[var(--ds-neutral-500)]">
                {d}
              </div>
            ))}
            {Array.from({ length: leadingBlank }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[96px] bg-[var(--ds-color-surface)]" />
            ))}
            {days.map((day) => {
              const iso = day.toISOString().slice(0, 10);
              const dayEvents = eventsByDate.get(iso) ?? [];
              return (
                <div key={iso} className="min-h-[96px] bg-[var(--ds-color-surface)] p-[4px]">
                  <p className="text-right text-[var(--ds-neutral-400)]">{day.getUTCDate()}</p>
                  <div className="space-y-[2px]">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="truncate rounded-[var(--ds-radius-sm)] bg-[var(--ds-neutral-50)] px-[4px] py-[2px]" title={ev.title}>
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
        <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)]">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[12px] uppercase tracking-[0.02em] text-[var(--ds-neutral-500)]">
              <tr>
                <th className="px-[16px] py-[8px]">Fecha</th>
                <th className="px-[16px] py-[8px]">Evento</th>
                <th className="px-[16px] py-[8px]">Tipo</th>
                <th className="px-[16px] py-[8px] text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-[16px] py-[32px] text-center text-[var(--ds-neutral-500)]">
                    No hay eventos este mes.
                  </td>
                </tr>
              )}
              {events.map((ev) => (
                <tr key={ev.id} className="border-t border-[var(--ds-neutral-100)]">
                  <td className="px-[16px] py-[8px]">{formatDateGT(ev.date)}</td>
                  <td className="px-[16px] py-[8px]">{ev.title}</td>
                  <td className="px-[16px] py-[8px]">
                    <Badge tone={TYPE_TONE[ev.type]}>{TYPE_LABELS[ev.type]}</Badge>
                  </td>
                  <td className="px-[16px] py-[8px] text-right">{formatCurrency(ev.amountMinor, ev.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
