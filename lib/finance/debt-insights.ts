import type { DebtStatus } from './debt-status';
import { computeMinimumPayment, simulatePayoff } from './interest';

const EXTRA_PAYMENT_MINOR = 50_000; // Q500.00
const SHARE_OF_DEBT_THRESHOLD = 20; // percent

export type InsightCard = {
  current_balance_minor: number;
  annual_interest_rate: number | null;
  minimum_payment_minor: number | null;
  minimum_payment_percentage: number | null;
};

/**
 * Rule-based, deterministic observations from stored data — not
 * AI-generated advice. Each insight is a computed fact or a projection
 * from the same amortization model the payment simulator uses.
 */
export function buildCardInsights(card: InsightCard, allCards: InsightCard[], status: DebtStatus): string[] {
  const insights: string[] = [];
  const aprPercent = card.annual_interest_rate ?? 0;

  if (status === 'minimum_payment_only') {
    insights.push('Solo estas pagando el minimo.');
  }
  if (status === 'generating_interest' || status === 'minimum_payment_only' || status === 'past_due') {
    insights.push('Es probable que generes intereses el proximo mes.');
  }

  if (card.current_balance_minor > 0 && aprPercent > 0) {
    const minimum = computeMinimumPayment(card);
    const base = simulatePayoff({ balanceMinor: card.current_balance_minor, aprPercent, monthlyPaymentMinor: minimum });
    const boosted = simulatePayoff({
      balanceMinor: card.current_balance_minor,
      aprPercent,
      monthlyPaymentMinor: minimum + EXTRA_PAYMENT_MINOR,
    });
    if (!base.neverPaysOff && !boosted.neverPaysOff && base.months > boosted.months) {
      const monthsSaved = base.months - boosted.months;
      insights.push(`Aumentar tu pago en Q500 podria reducir tu tiempo de pago en ${monthsSaved} ${monthsSaved === 1 ? 'mes' : 'meses'}.`);
    }
  }

  const cardsWithDebt = allCards.filter((c) => c.current_balance_minor > 0);
  if (cardsWithDebt.length > 1) {
    const highestApr = Math.max(...cardsWithDebt.map((c) => c.annual_interest_rate ?? 0));
    if (aprPercent > 0 && aprPercent >= highestApr && card.current_balance_minor > 0) {
      insights.push('Esta tarjeta tiene la tasa de interes mas alta entre tus deudas.');
    }
  }

  const totalDebt = allCards.reduce((sum, c) => sum + Math.max(c.current_balance_minor, 0), 0);
  if (totalDebt > 0 && card.current_balance_minor > 0) {
    const share = (card.current_balance_minor / totalDebt) * 100;
    if (share >= SHARE_OF_DEBT_THRESHOLD) {
      insights.push(`Esta tarjeta representa ${share.toFixed(0)}% de tu deuda total.`);
    }
  }

  return insights;
}
