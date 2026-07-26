import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getAccount, listAccountTransactions } from '@/features/accounts/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT } from '@/lib/dates/format';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { AccountDetailActions } from './account-detail-actions';

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const account = await getAccount(user.id, id);
  if (!account) notFound();

  const transactions = await listAccountTransactions(user.id, id);
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const monthTx = transactions.filter((t) => t.transaction_date.startsWith(monthPrefix) && t.status === 'cleared');
  const inflows = monthTx
    .filter((t) => (t.account_id === id && ['income', 'refund'].includes(t.transaction_type)) || (t.destination_account_id === id && t.transaction_type === 'transfer'))
    .reduce((s, t) => s + t.amount_minor, 0);
  const outflows = monthTx
    .filter((t) => t.account_id === id && ['expense', 'transfer', 'credit_card_payment', 'savings_contribution'].includes(t.transaction_type))
    .reduce((s, t) => s + t.amount_minor, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{account.name}</h1>
        <p className="text-sm text-slate-500">{account.institution_name ?? 'Sin institucion'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Saldo actual</CardTitle>
          <CardValue>{formatCurrency(account.current_balance_minor, account.currency)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Entradas del mes</CardTitle>
          <CardValue>{formatCurrency(inflows, account.currency)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Salidas del mes</CardTitle>
          <CardValue>{formatCurrency(outflows, account.currency)}</CardValue>
        </Card>
      </div>

      <AccountDetailActions account={account} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Movimientos recientes</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Descripcion</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Sin movimientos todavia.
                  </td>
                </tr>
              )}
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{formatDateGT(t.transaction_date)}</td>
                  <td className="px-4 py-2">{t.description}</td>
                  <td className="px-4 py-2">{t.transaction_type}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(t.amount_minor, account.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
