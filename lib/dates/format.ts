import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDateGT(dateStr: string, pattern = 'd MMM yyyy'): string {
  return format(parseISO(dateStr), pattern, { locale: es });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function firstDayOfMonthISO(date = new Date()): string {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

export function monthLabel(monthISO: string): string {
  return format(parseISO(monthISO), 'MMMM yyyy', { locale: es });
}
