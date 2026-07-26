import { formatCurrency } from '@/lib/finance/money';
import type { SafeToSpendBreakdown } from '@/lib/finance/safe-to-spend';

export function SafeToSpendCard({ breakdown }: { breakdown: SafeToSpendBreakdown }) {
  const isNegative = breakdown.safeToSpendMinor < 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">Puedes gastar (estimado)</p>
      <p className={`mt-1 text-3xl font-semibold ${isNegative ? 'text-red-600' : 'text-slate-900'}`}>
        {formatCurrency(breakdown.safeToSpendMinor)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Estimacion basada en tus datos registrados. No es asesoria financiera profesional.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">Saldo liquido</dt>
          <dd>{formatCurrency(breakdown.liquidBalanceMinor)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Ahorro reservado</dt>
          <dd>-{formatCurrency(breakdown.reservedSavingsMinor)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Obligaciones pendientes</dt>
          <dd>-{formatCurrency(breakdown.unpaidObligationsDueMinor)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Gastos pendientes</dt>
          <dd>-{formatCurrency(breakdown.pendingAccountExpensesMinor)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Ingresos esperados</dt>
          <dd>+{formatCurrency(breakdown.expectedIncomeMinor)}</dd>
        </div>
      </dl>
    </div>
  );
}
