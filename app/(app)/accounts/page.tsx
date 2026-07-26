import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listAccounts } from '@/features/accounts/queries';
import { totalLiquidBalance } from '@/lib/finance/balances';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { AccountCard } from '@/components/design-system/Cards';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workspace, ContextSection } from '@/components/layout/workspace';
import { StaggerList, StaggerItem } from '@/components/design-system/Stagger';
import { ACCOUNT_TYPE_LABELS } from '@/components/finance/account-type-labels';
import { NewAccountButton } from './account-form';

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accounts = await listAccounts(user.id);
  const active = accounts.filter((a) => !a.is_archived);
  const archived = accounts.filter((a) => a.is_archived);
  const liquidTotal = totalLiquidBalance(active);

  return (
    <Workspace
      context={
        <>
          <ContextSection title="Resumen">
            <Card className="space-y-[12px]">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--ds-neutral-500)]">Cuentas activas</span>
                <span className="text-[var(--ds-neutral-900)]">{active.length}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--ds-neutral-100)] pt-[12px] text-[13px]">
                <span className="text-[var(--ds-neutral-500)]">Saldo liquido total</span>
                <NumericDisplay amountMinor={liquidTotal} size="small" />
              </div>
            </Card>
          </ContextSection>

          {archived.length > 0 && (
            <ContextSection title="Cuentas archivadas">
              <div className="space-y-[8px]">
                {archived.map((account) => (
                  <Card key={account.id} className="opacity-60">
                    <div className="flex items-start justify-between gap-[8px]">
                      <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{account.name}</p>
                      <Badge tone="neutral">{ACCOUNT_TYPE_LABELS[account.account_type]}</Badge>
                    </div>
                    <div className="mt-[4px]">
                      <NumericDisplay amountMinor={account.current_balance_minor} currency={account.currency} size="small" />
                    </div>
                  </Card>
                ))}
              </div>
            </ContextSection>
          )}
        </>
      }
    >
      <div className="space-y-[40px]">
        <section>
          <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Cuentas</h1>
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
            <StaggerList className="grid gap-[12px] sm:grid-cols-2">
              {active.map((account) => (
                <StaggerItem key={account.id}>
                  <Link href={`/accounts/${account.id}`}>
                    <AccountCard
                      name={account.name}
                      institution={account.institution_name ?? 'Sin institucion'}
                      balanceMinor={account.current_balance_minor}
                      currency={account.currency}
                      typeLabel={ACCOUNT_TYPE_LABELS[account.account_type]}
                    />
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </section>
      </div>
    </Workspace>
  );
}
