import type { SafeToSpendBreakdown } from '@/lib/finance/safe-to-spend';
import { Card } from '@/components/design-system/Card';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';

export function SafeToSpendCard({ breakdown }: { breakdown: SafeToSpendBreakdown }) {
  const isNegative = breakdown.safeToSpendMinor < 0;

  return (
    <Card className="p-[24px]">
      <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">Puedes gastar (estimado)</p>
      <div className="mt-[4px]">
        <NumericDisplay
          amountMinor={breakdown.safeToSpendMinor}
          size="numericDisplay"
          tone={isNegative ? 'negative' : 'neutral'}
        />
      </div>
      <p className="mt-[8px] text-[12px] text-[var(--ds-neutral-500)]">
        Estimacion basada en tus datos registrados. No es asesoria financiera profesional.
      </p>

      <dl className="mt-[24px] grid grid-cols-2 gap-[16px] border-t border-[var(--ds-neutral-200)] pt-[16px] sm:grid-cols-3">
        <div>
          <dt className="text-[12px] text-[var(--ds-neutral-500)]">Saldo liquido</dt>
          <dd>
            <NumericDisplay amountMinor={breakdown.liquidBalanceMinor} size="small" />
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--ds-neutral-500)]">Ahorro reservado</dt>
          <dd>
            <NumericDisplay amountMinor={-breakdown.reservedSavingsMinor} size="small" />
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--ds-neutral-500)]">Obligaciones pendientes</dt>
          <dd>
            <NumericDisplay amountMinor={-breakdown.unpaidObligationsDueMinor} size="small" />
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--ds-neutral-500)]">Gastos pendientes</dt>
          <dd>
            <NumericDisplay amountMinor={-breakdown.pendingAccountExpensesMinor} size="small" />
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-[var(--ds-neutral-500)]">Ingresos esperados</dt>
          <dd>
            <NumericDisplay amountMinor={breakdown.expectedIncomeMinor} size="small" showSign />
          </dd>
        </div>
      </dl>
    </Card>
  );
}
