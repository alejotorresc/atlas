import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDateGT(dateStr: string, pattern = 'd MMM yyyy'): string {
  return format(parseISO(dateStr), pattern, { locale: es });
}

const APP_TIMEZONE = 'America/Guatemala';

export function todayISO(): string {
  // Guatemala never observes DST (fixed UTC-6), but the app can run on a
  // server clock in any timezone (Vercel functions run in UTC) — using
  // Date#toISOString() here would date evening transactions (after 6pm GT)
  // as tomorrow, which then don't show up under "today" in the app.
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(new Date());
}

export function firstDayOfMonthISO(date = new Date()): string {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export function monthLabel(monthISO: string): string {
  return format(parseISO(monthISO), 'MMMM yyyy', { locale: es });
}
