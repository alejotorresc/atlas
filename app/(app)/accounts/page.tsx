import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listAccounts } from '@/features/accounts/queries';
import { totalLiquidBalance } from '@/lib/finance/balances';
import { formatCurrency } from '@/lib/finance/money';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewAccountButton } from './account-form';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Monetaria',
  savings: 'Ahorro',
  cash: 'Efectivo',
  digital_wallet: 'Billetera digital',
  investment: 'Inversion',
  other: 'Otro',
};

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accounts = await listAccounts(user.id);
  const active = accounts.filter((a) => !a.is_archived);
  const archived = accounts.filter((a) => a.is_archived);
  const liquidTotal = totalLiquidBalance(active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cuentas</h1>
        <NewAccountButton />
      </div>

      <Card className="max-w-xs">
        <CardTitle>Saldo liquido total</CardTitle>
        <CardValue>{formatCurrency(liquidTotal)}</CardValue>
      </Card>

      {active.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">Aun no tienes cuentas. Crea la primera para empezar a registrar movimientos.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <Card className="h-full hover:border-slate-400">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-slate-500">{account.institution_name ?? 'Sin institucion'}</p>
                  </div>
                  <Badge>{ACCOUNT_TYPE_LABELS[account.account_type]}</Badge>
                </div>
                <p className="mt-3 text-lg font-semibold">{formatCurrency(account.current_balance_minor, account.currency)}</p>
                {!account.include_in_available_balance && (
                  <p className="mt-1 text-xs text-slate-500">No incluida en saldo disponible</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500">Cuentas archivadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((account) => (
              <Card key={account.id} className="opacity-60">
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-slate-500">{formatCurrency(account.current_balance_minor, account.currency)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
