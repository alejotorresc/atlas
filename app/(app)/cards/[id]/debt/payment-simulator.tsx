'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedAmount, AnimatedNumber } from '@/components/design-system/AnimatedNumber';
import { simulatePayoff } from '@/lib/finance/interest';
import { parseMoneyToMinorUnits, formatMinorUnits } from '@/lib/finance/money';

function parsePaymentInput(raw: string): number {
  try {
    const parsed = parseMoneyToMinorUnits(raw);
    return parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * "What should I pay?" simulator — recomputes the full amortization
 * instantly on every keystroke, client-side only (no server round trip).
 */
export function PaymentSimulator({
  balanceMinor,
  aprPercent,
  currency,
  defaultPaymentMinor,
}: {
  balanceMinor: number;
  aprPercent: number;
  currency: string;
  defaultPaymentMinor: number;
}) {
  const [paymentInput, setPaymentInput] = useState(formatMinorUnits(defaultPaymentMinor));
  const paymentMinor = parsePaymentInput(paymentInput);

  const result = useMemo(
    () => simulatePayoff({ balanceMinor, aprPercent, monthlyPaymentMinor: paymentMinor }),
    [balanceMinor, aprPercent, paymentMinor],
  );

  return (
    <Card>
      <h2 className="font-display mb-[4px] text-[15px] font-medium text-[var(--ds-neutral-900)]">Simulador de pagos</h2>
      <p className="mb-[16px] text-[13px] text-[var(--ds-neutral-500)]">Ajusta tu pago mensual y mira como cambia tu plazo de pago al instante.</p>

      <div className="max-w-[200px]">
        <Label htmlFor="simulator-payment">Pago mensual</Label>
        <Input id="simulator-payment" inputMode="decimal" value={paymentInput} onChange={(e) => setPaymentInput(e.target.value)} />
      </div>

      {paymentMinor <= 0 ? (
        <p className="mt-[20px] text-[13px] text-[var(--ds-neutral-500)]">Ingresa un monto para simular.</p>
      ) : result.neverPaysOff ? (
        <p className="mt-[20px] text-[13px] text-[var(--ds-color-danger-text)]">
          Con este pago nunca terminarias de pagar la deuda: el interes generado cada mes supera el monto que pagas.
        </p>
      ) : (
        <div className="mt-[20px] grid grid-cols-1 gap-[16px] sm:grid-cols-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Pago estimado</p>
            <p className="font-display mt-[4px] text-[24px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
              <AnimatedNumber value={result.months} suffix={result.months === 1 ? ' mes' : ' meses'} />
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Interes restante estimado</p>
            <p className="font-display mt-[4px] text-[24px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
              <AnimatedAmount amountMinor={result.totalInterestMinor} currency={currency} />
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Total a pagar</p>
            <p className="font-display mt-[4px] text-[24px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
              <AnimatedAmount amountMinor={result.totalPaidMinor} currency={currency} />
            </p>
          </div>
        </div>
      )}

      <p className="mt-[16px] text-[12px] text-[var(--ds-neutral-400)]">
        Estimacion basada en tus datos registrados. Tu estado de cuenta es el valor oficial.
      </p>
    </Card>
  );
}
