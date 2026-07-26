import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listAccounts } from '@/features/accounts/queries';
import { totalLiquidBalance } from '@/lib/finance/balances';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { AccountCard } from '@/components/design-system/Cards';
import { Card } from '@/components/ui/card';
import { NewAccountButton } from './account-form';

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accounts = await listAccounts(user.id);
  const active = accounts.filter((a) => !a.is_archived);
  const archived = accounts.filter((a) => a.is_archived);
  const liquidTotal = totalLiquidBalance(active);

  return (
    <div className="space-y-[40px]">
      <section>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Cuentas</h1>
        <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Saldo liquido total</p>
        <div className="mt-[4px]">
          <NumericDisplay amountMinor={liquidTotal} size="display" />
        </div>
        <div className="mt-[20px]">
          <NewAccountButton />
        </div>
      </section>

      <section>
        {active.length === 0 ? (
          <Card>
            <p className="text-[15px] text-[var(--ds-neutral-600)]">Aun no tienes cuentas. Crea la primera para empezar a registrar movimientos.</p>
          </Card>
        ) : (
          <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {active.map((account) => (
              <Link key={account.id} href={`/accounts/${account.id}`}>
                <AccountCard
                  name={account.name}
                  institution={account.institution_name ?? 'Sin institucion'}
                  balanceMinor={account.current_balance_minor}
                  currency={account.currency}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section>
          <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">CUENTAS ARCHIVADAS</h2>
          <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((account) => (
              <Card key={account.id} className="opacity-60">
                <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{account.name}</p>
                <div className="mt-[4px]">
                  <NumericDisplay amountMinor={account.current_balance_minor} currency={account.currency} size="small" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
