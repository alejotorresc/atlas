import { describe, expect, it } from 'vitest';
import { buildCardInsights } from './debt-insights';

describe('buildCardInsights', () => {
  it('flags minimum-payment-only cards and likely interest', () => {
    const card = { current_balance_minor: 1_000_000, annual_interest_rate: 24, minimum_payment_minor: 25_000, minimum_payment_percentage: null };
    const insights = buildCardInsights(card, [card], 'minimum_payment_only');
    expect(insights).toContain('Solo estas pagando el minimo.');
    expect(insights).toContain('Es probable que generes intereses el proximo mes.');
  });

  it('suggests the payoff-time reduction from paying Q500 more when it actually helps', () => {
    const card = { current_balance_minor: 1_000_000, annual_interest_rate: 24, minimum_payment_minor: 25_000, minimum_payment_percentage: null };
    const insights = buildCardInsights(card, [card], 'generating_interest');
    expect(insights.some((i) => i.includes('Aumentar tu pago en Q500'))).toBe(true);
  });

  it('identifies the highest-APR card among multiple debts', () => {
    const high = { current_balance_minor: 200_000, annual_interest_rate: 39, minimum_payment_minor: 10_000, minimum_payment_percentage: null };
    const low = { current_balance_minor: 200_000, annual_interest_rate: 18, minimum_payment_minor: 10_000, minimum_payment_percentage: null };
    const insights = buildCardInsights(high, [high, low], 'generating_interest');
    expect(insights).toContain('Esta tarjeta tiene la tasa de interes mas alta entre tus deudas.');
    const lowInsights = buildCardInsights(low, [high, low], 'generating_interest');
    expect(lowInsights).not.toContain('Esta tarjeta tiene la tasa de interes mas alta entre tus deudas.');
  });

  it('flags a card representing a large share of total debt', () => {
    const dominant = { current_balance_minor: 800_000, annual_interest_rate: 20, minimum_payment_minor: 20_000, minimum_payment_percentage: null };
    const minor = { current_balance_minor: 200_000, annual_interest_rate: 20, minimum_payment_minor: 5_000, minimum_payment_percentage: null };
    const insights = buildCardInsights(dominant, [dominant, minor], 'generating_interest');
    expect(insights.some((i) => i.includes('% de tu deuda total'))).toBe(true);
  });

  it('returns no insights for a paid-in-full card', () => {
    const card = { current_balance_minor: 0, annual_interest_rate: 24, minimum_payment_minor: null, minimum_payment_percentage: null };
    expect(buildCardInsights(card, [card], 'paid_in_full')).toEqual([]);
  });
});
