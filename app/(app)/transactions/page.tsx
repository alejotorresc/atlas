import { getCurrentUser } from '@/lib/supabase/server';
import { listTransactions } from '@/features/transactions/queries';
import { listAccounts } from '@/features/accounts/queries';
import { listCards } from '@/features/cards/queries';
import { listCategories } from '@/features/categories/queries';
import { listSavingsGoals } from '@/features/savings/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT } from '@/lib/dates/format';
import { Badge } from '@/components/ui/badge';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { NewTransactionButton } from './transaction-form';
import { CancelTransactionButton } from './transaction-row-actions';
import type { TransactionStatus, TransactionType } from '@/types/database';

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  credit_card_payment: 'Pago de tarjeta',
  savings_contribution: 'Aporte a ahorro',
  savings_withdrawal: 'Retiro de ahorro',
  refund: 'Reembolso',
  adjustment: 'Ajuste',
};

const STATUS_TONE: Record<TransactionStatus, 'success' | 'warning' | 'neutral'> = {
  cleared: 'success',
  pending: 'warning',
  cancelled: 'neutral',
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const month = params.month ?? new Date().toISOString().slice(0, 7);

  const [{ transactions, total, totalIncome, totalExpense }, accounts, cards, incomeCategories, expenseCategories, savingsGoals] =
    await Promise.all([
      listTransactions(user.id, {
        month: params.from ? undefined : month,
        from: params.from,
        to: params.to,
        type: params.type as TransactionType | undefined,
        accountId: params.accountId,
        creditCardId: params.creditCardId,
        categoryId: params.categoryId,
        status: params.status as TransactionStatus | undefined,
        search: params.q,
        page: params.page ? Number(params.page) : 1,
      }),
      listAccounts(user.id),
      listCards(user.id),
      listCategories(user.id, 'income'),
      listCategories(user.id, 'expense'),
      listSavingsGoals(user.id),
    ]);

  const net = totalIncome - totalExpense;

  return (
    <div className="space-y-[32px]">
      <section>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Actividad</h1>
        <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Flujo neto (pagina actual)</p>
        <div className="mt-[4px]">
          <NumericDisplay amountMinor={net} size="display" tone={net < 0 ? 'negative' : 'neutral'} />
        </div>
        <p className="mt-[8px] text-[15px] text-[var(--ds-neutral-600)]">
          Ingresos <NumericDisplay amountMinor={totalIncome} size="small" className="inline" tone="positive" /> · Gastos{' '}
          <NumericDisplay amountMinor={totalExpense} size="small" className="inline" tone="negative" /> · {total} resultados
        </p>
        <div className="mt-[20px]">
          <NewTransactionButton
            accounts={accounts.filter((a) => !a.is_archived)}
            cards={cards.filter((c) => !c.is_archived)}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            savingsGoals={savingsGoals.filter((g) => g.status === 'active')}
            defaultOpen={params.new === '1'}
          />
        </div>
      </section>

      <form className="grid grid-cols-2 gap-[12px] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] p-[16px] sm:grid-cols-4 lg:grid-cols-6" method="get">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ds-neutral-600)]">Mes</label>
          <input type="month" name="month" defaultValue={month} className="w-full rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ds-neutral-600)]">Tipo</label>
          <select name="type" defaultValue={params.type ?? ''} className="w-full rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ds-neutral-600)]">Cuenta</label>
          <select name="accountId" defaultValue={params.accountId ?? ''} className="w-full rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm">
            <option value="">Todas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ds-neutral-600)]">Tarjeta</label>
          <select name="creditCardId" defaultValue={params.creditCardId ?? ''} className="w-full rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm">
            <option value="">Todas</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ds-neutral-600)]">Estado</label>
          <select name="status" defaultValue={params.status ?? ''} className="w-full rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="cleared">Confirmado</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--ds-neutral-600)]">Buscar</label>
          <input type="text" name="q" defaultValue={params.q ?? ''} placeholder="Descripcion o comercio" className="w-full rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-4 lg:col-span-6">
          <button type="submit" className="rounded-md bg-[var(--ds-color-primary)] px-4 py-1.5 text-sm font-medium text-white">
            Filtrar
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)]">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[12px] uppercase tracking-[0.02em] text-[var(--ds-neutral-500)]">
            <tr>
              <th className="px-[16px] py-[8px]">Fecha</th>
              <th className="px-[16px] py-[8px]">Descripcion</th>
              <th className="px-[16px] py-[8px]">Tipo</th>
              <th className="px-[16px] py-[8px]">Estado</th>
              <th className="px-[16px] py-[8px] text-right">Monto</th>
              <th className="px-[16px] py-[8px]" />
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-[16px] py-[32px] text-center text-[var(--ds-neutral-500)]">
                  No hay movimientos con estos filtros.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-[var(--ds-neutral-100)]">
                <td className="px-[16px] py-[8px]">{formatDateGT(t.transaction_date)}</td>
                <td className="px-[16px] py-[8px]">
                  {t.description}
                  {t.merchant ? <span className="text-[var(--ds-neutral-400)]"> · {t.merchant}</span> : null}
                </td>
                <td className="px-[16px] py-[8px]">{TYPE_LABELS[t.transaction_type]}</td>
                <td className="px-[16px] py-[8px]">
                  <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                </td>
                <td className="px-[16px] py-[8px] text-right">{formatCurrency(t.amount_minor, t.currency)}</td>
                <td className="px-[16px] py-[8px] text-right">{t.status !== 'cancelled' && <CancelTransactionButton id={t.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
