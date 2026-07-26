'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedAmount, AnimatedNumber } from '@/components/design-system/AnimatedNumber';
import { simulatePayoff } from '@/lib/finance/interest';
import { creditUtilization } from '@/lib/finance/credit';
import { parseMoneyToMinorUnits } from '@/lib/finance/money';

function parseAmountInput(raw: string): number {
  try {
    const parsed = parseMoneyToMinorUnits(raw);
    return parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * "What if I pay X today?" — a one-time extra/lump-sum payment applied
 * immediately, then the same monthly payment continues. Compares against
 * the baseline (no extra payment) to show interest and time saved.
 */
export function WhatIfSimulator({
  balanceMinor,
  creditLimitMinor,
  aprPercent,
  currency,
  monthlyPaymentMinor,
}: {
  balanceMinor: number;
  creditLimitMinor: number;
  aprPercent: number;
  currency: string;
  monthlyPaymentMinor: number;
}) {
  const [extraInput, setExtraInput] = useState('5000.00');
  const extraMinor = Math.min(parseAmountInput(extraInput), balanceMinor);

  const newBalanceMinor = Math.max(balanceMinor - extraMinor, 0);
  const newUtilization = creditUtilization(newBalanceMinor, creditLimitMinor);

  const { baseline, afterExtra } = useMemo(
    () => ({
      baseline: simulatePayoff({ balanceMinor, aprPercent, monthlyPaymentMinor }),
      afterExtra: simulatePayoff({ balanceMinor: newBalanceMinor, aprPercent, monthlyPaymentMinor }),
    }),
    [balanceMinor, newBalanceMinor, aprPercent, monthlyPaymentMinor],
  );

  const canCompare = !baseline.neverPaysOff && !afterExtra.neverPaysOff;
  const interestReductionMinor = canCompare ? Math.max(baseline.totalInterestMinor - afterExtra.totalInterestMinor, 0) : 0;
  const monthsSaved = canCompare ? Math.max(baseline.months - afterExtra.months, 0) : 0;

  return (
    <Card>
      <h2 className="font-display mb-[4px] text-[15px] font-medium text-[var(--ds-neutral-900)]">Que pasa si...</h2>
      <p className="mb-[16px] text-[13px] text-[var(--ds-neutral-500)]">Simula un pago extra hoy, manteniendo tu pago mensual actual.</p>

      <div className="max-w-[200px]">
        <Label htmlFor="whatif-amount">Pago extra hoy</Label>
        <Input id="whatif-amount" inputMode="decimal" value={extraInput} onChange={(e) => setExtraInput(e.target.value)} />
      </div>

      <div className="mt-[20px] grid grid-cols-2 gap-[16px] sm:grid-cols-4">
        <div>
          <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Nuevo saldo</p>
          <p className="font-display mt-[4px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
            <AnimatedAmount amountMinor={newBalanceMinor} currency={currency} />
          </p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Nueva utilizacion</p>
          <p className="font-display mt-[4px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
            <AnimatedNumber value={newUtilization} suffix="%" />
          </p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Reduccion de interes</p>
          <p className="font-display mt-[4px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
            {canCompare ? <AnimatedAmount amountMinor={interestReductionMinor} currency={currency} /> : '—'}
          </p>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Meses ahorrados</p>
          <p className="font-display mt-[4px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
            {canCompare ? <AnimatedNumber value={monthsSaved} /> : '—'}
          </p>
        </div>
      </div>
    </Card>
  );
}
