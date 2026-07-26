import { getCurrentUser } from '@/lib/supabase/server';
import { listTransactions } from '@/features/transactions/queries';
import { listAccounts } from '@/features/accounts/queries';
import { listCards } from '@/features/cards/queries';
import { listCategories } from '@/features/categories/queries';
import { listSavingsGoals } from '@/features/savings/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT } from '@/lib/dates/format';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Movimientos</h1>
        <NewTransactionButton
          accounts={accounts.filter((a) => !a.is_archived)}
          cards={cards.filter((c) => !c.is_archived)}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          savingsGoals={savingsGoals.filter((g) => g.status === 'active')}
          defaultOpen={params.new === '1'}
        />
      </div>

      <form className="grid grid-cols-2 gap-3 rounded-lg border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-4 sm:grid-cols-4 lg:grid-cols-6" method="get">
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-4">
          <p className="text-xs text-[var(--ds-neutral-500)]">Ingresos (pagina actual)</p>
          <p className="text-lg font-semibold text-[var(--ds-color-success)]">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-lg border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-4">
          <p className="text-xs text-[var(--ds-neutral-500)]">Gastos (pagina actual)</p>
          <p className="text-lg font-semibold text-[var(--ds-color-danger)]">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="rounded-lg border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-4">
          <p className="text-xs text-[var(--ds-neutral-500)]">Total de resultados</p>
          <p className="text-lg font-semibold">{total}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--ds-neutral-200)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--ds-neutral-50)] text-left text-xs uppercase text-[var(--ds-neutral-500)]">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Descripcion</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-right">Monto</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--ds-neutral-500)]">
                  No hay movimientos con estos filtros.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-[var(--ds-neutral-100)]">
                <td className="px-4 py-2">{formatDateGT(t.transaction_date)}</td>
                <td className="px-4 py-2">
                  {t.description}
                  {t.merchant ? <span className="text-[var(--ds-neutral-400)]"> · {t.merchant}</span> : null}
                </td>
                <td className="px-4 py-2">{TYPE_LABELS[t.transaction_type]}</td>
                <td className="px-4 py-2">
                  <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(t.amount_minor, t.currency)}</td>
                <td className="px-4 py-2 text-right">{t.status !== 'cancelled' && <CancelTransactionButton id={t.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
