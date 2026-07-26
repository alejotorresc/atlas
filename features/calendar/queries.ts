import { createClient } from '@/lib/supabase/server';
import { listCards } from '@/features/cards/queries';
import { listUpcomingOccurrences } from '@/features/obligations/queries';
import { nextMonthlyDayOccurrence } from '@/lib/finance/dates';

export type CalendarEventType = 'obligation' | 'card_statement' | 'card_payment' | 'expected_income';

export interface CalendarEvent {
  id: string;
  date: string;
  type: CalendarEventType;
  title: string;
  amountMinor: number;
  currency: string;
  relatedId: string;
  status?: string;
}

export async function listCalendarEvents(userId: string, monthStart: Date, monthEnd: Date): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const events: CalendarEvent[] = [];

  const occurrences = await listUpcomingOccurrences(userId, monthStart.toISOString().slice(0, 10), monthEnd.toISOString().slice(0, 10));
  const { data: obligations } = await supabase.from('recurring_obligations').select('id, name, currency').eq('user_id', userId);
  const obligationsById = new Map((obligations ?? []).map((o) => [o.id, o]));

  for (const occ of occurrences) {
    const obligation = obligationsById.get(occ.recurring_obligation_id);
    events.push({
      id: `obl-${occ.id}`,
      date: occ.due_date,
      type: 'obligation',
      title: obligation?.name ?? 'Obligacion',
      amountMinor: occ.expected_amount_minor,
      currency: obligation?.currency ?? 'GTQ',
      relatedId: occ.recurring_obligation_id,
      status: occ.status,
    });
  }

  const cards = await listCards(userId);
  for (const card of cards.filter((c) => !c.is_archived)) {
    const statementDate = nextMonthlyDayOccurrence(monthStart, card.statement_day);
    const paymentDate = nextMonthlyDayOccurrence(monthStart, card.payment_due_day);
    if (statementDate <= monthEnd) {
      events.push({
        id: `stmt-${card.id}`,
        date: statementDate.toISOString().slice(0, 10),
        type: 'card_statement',
        title: `Corte: ${card.name}`,
        amountMinor: card.current_balance_minor,
        currency: card.currency,
        relatedId: card.id,
      });
    }
    if (paymentDate <= monthEnd) {
      events.push({
        id: `pay-${card.id}`,
        date: paymentDate.toISOString().slice(0, 10),
        type: 'card_payment',
        title: `Pago: ${card.name}`,
        amountMinor: card.minimum_payment_minor ?? card.current_balance_minor,
        currency: card.currency,
        relatedId: card.id,
      });
    }
  }

  const { data: pendingIncome } = await supabase
    .from('transactions')
    .select('id, transaction_date, description, amount_minor, currency')
    .eq('user_id', userId)
    .eq('transaction_type', 'income')
    .eq('status', 'pending')
    .gte('transaction_date', monthStart.toISOString().slice(0, 10))
    .lte('transaction_date', monthEnd.toISOString().slice(0, 10));

  for (const income of pendingIncome ?? []) {
    events.push({
      id: `inc-${income.id}`,
      date: income.transaction_date,
      type: 'expected_income',
      title: income.description,
      amountMinor: income.amount_minor,
      currency: income.currency,
      relatedId: income.id,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
