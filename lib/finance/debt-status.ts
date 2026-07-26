import { resolveDayOfMonth } from './dates';
import { computeMinimumPayment } from './interest';

export type DebtStatus =
  | 'payment_agreement'
  | 'over_limit'
  | 'paid_in_full'
  | 'past_due'
  | 'financing_balance'
  | 'minimum_payment_only'
  | 'current'
  | 'generating_interest';

type StatusCard = {
  current_balance_minor: number;
  credit_limit_minor: number;
  statement_balance_minor: number;
  payment_due_day: number;
  minimum_payment_minor: number | null;
  minimum_payment_percentage: number | null;
  in_payment_agreement: boolean;
};

export interface DebtStatusContext {
  hasActiveInstallmentPlan: boolean;
  lastPaymentMinor: number | null;
  lastPaymentDate: string | null;
  today: Date;
}

function toUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Most recent due date that is on or before `today` (the current/just-closed cycle's due date). */
function lastDueDate(today: Date, dueDay: number): Date {
  const day = toUtcDay(today);
  const candidate = resolveDayOfMonth(day.getUTCFullYear(), day.getUTCMonth(), dueDay);
  if (candidate <= day) return candidate;
  return resolveDayOfMonth(day.getUTCFullYear(), day.getUTCMonth() - 1, dueDay);
}

/**
 * Automatically classifies a card's debt status from its stored data.
 * Priority order matters: a manual payment-agreement flag overrides
 * everything else, over-limit/paid-in-full are unambiguous facts, and the
 * remaining states are inferred from whether/when the last payment cleared
 * relative to the due date.
 */
export function classifyDebtStatus(card: StatusCard, ctx: DebtStatusContext): DebtStatus {
  if (card.in_payment_agreement) return 'payment_agreement';
  if (card.current_balance_minor > card.credit_limit_minor && card.credit_limit_minor > 0) return 'over_limit';
  if (card.current_balance_minor <= 0) return 'paid_in_full';

  const dueDate = lastDueDate(ctx.today, card.payment_due_day);
  const paidThisCycle = ctx.lastPaymentDate != null && toUtcDay(new Date(ctx.lastPaymentDate)) >= dueDate;

  if (!paidThisCycle && toUtcDay(ctx.today) > dueDate) return 'past_due';
  if (ctx.hasActiveInstallmentPlan) return 'financing_balance';

  if (paidThisCycle && ctx.lastPaymentMinor != null) {
    if (ctx.lastPaymentMinor >= card.statement_balance_minor && card.statement_balance_minor > 0) return 'current';

    const minimum = computeMinimumPayment(card);
    const tolerance = Math.max(Math.round(minimum * 0.05), 100);
    if (Math.abs(ctx.lastPaymentMinor - minimum) <= tolerance) return 'minimum_payment_only';
  }

  return 'generating_interest';
}

export type InterestPressure = 'low' | 'medium' | 'high' | 'critical';

/** Coarse pressure reading combining utilization and debt status, for the visual indicator. */
export function interestPressure(utilizationPercent: number, status: DebtStatus): InterestPressure {
  if (status === 'past_due' || status === 'over_limit' || utilizationPercent >= 90) return 'critical';
  if (status === 'generating_interest' || status === 'minimum_payment_only' || utilizationPercent >= 75) return 'high';
  if (utilizationPercent >= 30) return 'medium';
  return 'low';
}
