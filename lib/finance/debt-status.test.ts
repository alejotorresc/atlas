import { describe, expect, it } from 'vitest';
import { classifyDebtStatus, interestPressure } from './debt-status';

const baseCard = {
  current_balance_minor: 500_000,
  credit_limit_minor: 1_000_000,
  statement_balance_minor: 500_000,
  payment_due_day: 15,
  minimum_payment_minor: null,
  minimum_payment_percentage: null,
  in_payment_agreement: false,
};

const baseCtx = {
  hasActiveInstallmentPlan: false,
  lastPaymentMinor: null,
  lastPaymentDate: null,
  today: new Date(Date.UTC(2026, 6, 20)), // 2026-07-20, due day already passed this month
};

describe('classifyDebtStatus', () => {
  it('prioritizes the manual payment-agreement flag over everything else', () => {
    expect(classifyDebtStatus({ ...baseCard, in_payment_agreement: true }, baseCtx)).toBe('payment_agreement');
  });

  it('flags a balance over the credit limit', () => {
    expect(classifyDebtStatus({ ...baseCard, current_balance_minor: 1_200_000 }, baseCtx)).toBe('over_limit');
  });

  it('recognizes a zero balance as paid in full', () => {
    expect(classifyDebtStatus({ ...baseCard, current_balance_minor: 0 }, baseCtx)).toBe('paid_in_full');
  });

  it('flags past due when the due date passed with no qualifying payment', () => {
    expect(classifyDebtStatus(baseCard, baseCtx)).toBe('past_due');
  });

  it('reports financing_balance when an installment plan is active and not past due', () => {
    const ctx = { ...baseCtx, lastPaymentMinor: 500_000, lastPaymentDate: '2026-07-16', hasActiveInstallmentPlan: true };
    expect(classifyDebtStatus(baseCard, ctx)).toBe('financing_balance');
  });

  it('reports current when the statement balance was paid in full this cycle', () => {
    const ctx = { ...baseCtx, lastPaymentMinor: 500_000, lastPaymentDate: '2026-07-16' };
    expect(classifyDebtStatus(baseCard, ctx)).toBe('current');
  });

  it('reports minimum_payment_only when the last payment matches the computed minimum', () => {
    const card = { ...baseCard, minimum_payment_minor: 25_000 };
    const ctx = { ...baseCtx, lastPaymentMinor: 25_000, lastPaymentDate: '2026-07-16' };
    expect(classifyDebtStatus(card, ctx)).toBe('minimum_payment_only');
  });

  it('falls back to generating_interest for a revolving balance paid above minimum but below statement', () => {
    const card = { ...baseCard, minimum_payment_minor: 25_000 };
    const ctx = { ...baseCtx, lastPaymentMinor: 100_000, lastPaymentDate: '2026-07-16' };
    expect(classifyDebtStatus(card, ctx)).toBe('generating_interest');
  });
});

describe('interestPressure', () => {
  it('escalates with utilization and worsening status', () => {
    expect(interestPressure(10, 'current')).toBe('low');
    expect(interestPressure(40, 'current')).toBe('medium');
    expect(interestPressure(50, 'generating_interest')).toBe('high');
    expect(interestPressure(95, 'current')).toBe('critical');
    expect(interestPressure(10, 'past_due')).toBe('critical');
    expect(interestPressure(10, 'over_limit')).toBe('critical');
  });
});
