import { describe, expect, it } from 'vitest';
import { monthlyCashFlow } from './cashflow';

describe('monthlyCashFlow', () => {
  it('computes cleared income minus cleared expenses', () => {
    const result = monthlyCashFlow([
      { transaction_type: 'income', amount_minor: 5000, status: 'cleared' },
      { transaction_type: 'expense', amount_minor: 2000, status: 'cleared' },
    ]);
    expect(result).toEqual({ income: 5000, expenses: 2000, netCashFlow: 3000 });
  });

  it('excludes transfers and credit card payments from totals', () => {
    const result = monthlyCashFlow([
      { transaction_type: 'income', amount_minor: 5000, status: 'cleared' },
      { transaction_type: 'transfer', amount_minor: 1000, status: 'cleared' },
      { transaction_type: 'credit_card_payment', amount_minor: 800, status: 'cleared' },
    ]);
    expect(result).toEqual({ income: 5000, expenses: 0, netCashFlow: 5000 });
  });

  it('excludes cancelled transactions entirely', () => {
    const result = monthlyCashFlow([
      { transaction_type: 'expense', amount_minor: 2000, status: 'cancelled' },
      { transaction_type: 'income', amount_minor: 1000, status: 'cleared' },
    ]);
    expect(result).toEqual({ income: 1000, expenses: 0, netCashFlow: 1000 });
  });

  it('excludes pending transactions from cleared historical totals', () => {
    const result = monthlyCashFlow([
      { transaction_type: 'expense', amount_minor: 2000, status: 'pending' },
      { transaction_type: 'income', amount_minor: 1000, status: 'cleared' },
    ]);
    expect(result).toEqual({ income: 1000, expenses: 0, netCashFlow: 1000 });
  });

  it('nets refunds against expenses', () => {
    const result = monthlyCashFlow([
      { transaction_type: 'expense', amount_minor: 2000, status: 'cleared' },
      { transaction_type: 'refund', amount_minor: 500, status: 'cleared' },
    ]);
    expect(result.expenses).toBe(1500);
  });
});
