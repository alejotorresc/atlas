import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listSavingsGoals } from '@/features/savings/queries';
import { listAccounts } from '@/features/accounts/queries';
import { savingsProgressRatio, calculateSavingsPace } from '@/lib/finance/savings-pace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { SavingsCard } from '@/components/design-system/Cards';
import { NewSavingsGoalButton } from './savings-goal-form';

export default async function SavingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [goals, accounts] = await Promise.all([listSavingsGoals(user.id), listAccounts(user.id)]);
  const active = goals.filter((g) => g.status === 'active');
  const completedOrPaused = goals.filter((g) => g.status !== 'active');
  const totalSaved = goals.filter((g) => g.status !== 'cancelled').reduce((s, g) => s + g.current_amount_minor, 0);
  const today = new Date();

  return (
    <div className="space-y-[40px]">
      <section>
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Ahorros</h1>
        <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Total ahorrado</p>
        <div className="mt-[4px]">
          <NumericDisplay amountMinor={totalSaved} size="display" />
        </div>
        <div className="mt-[20px]">
          <NewSavingsGoalButton accounts={accounts.filter((a) => !a.is_archived)} />
        </div>
      </section>

      <section>
        {active.length === 0 ? (
          <Card>
            <p className="text-[15px] text-[var(--ds-neutral-600)]">Aun no tienes metas de ahorro activas.</p>
          </Card>
        ) : (
          <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {active.map((goal) => {
              const pace = goal.target_date
                ? calculateSavingsPace(goal.current_amount_minor, goal.target_amount_minor, new Date(goal.target_date), today, 1)
                : null;

              return (
                <Link key={goal.id} href={`/savings/${goal.id}`}>
                  <SavingsCard
                    name={goal.name}
                    currentMinor={goal.current_amount_minor}
                    targetMinor={goal.target_amount_minor}
                    currency={goal.currency}
                    paceLabel={
                      pace
                        ? `${(savingsProgressRatio(goal.current_amount_minor, goal.target_amount_minor) * 100).toFixed(0)}% · sugerido ${pace.status === 'behind' ? 'aumentar' : pace.status === 'ahead' ? 'vas adelantado' : 'mantener'} el ritmo`
                        : `${(savingsProgressRatio(goal.current_amount_minor, goal.target_amount_minor) * 100).toFixed(0)}% alcanzado`
                    }
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {completedOrPaused.length > 0 && (
        <section>
          <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">
            COMPLETADAS / PAUSADAS / CANCELADAS
          </h2>
          <div className="grid gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
            {completedOrPaused.map((goal) => (
              <Link key={goal.id} href={`/savings/${goal.id}`}>
                <Card className="opacity-70 hover:opacity-100">
                  <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{goal.name}</p>
                  <div className="mt-[4px]">
                    <NumericDisplay amountMinor={goal.current_amount_minor} currency={goal.currency} size="small" />
                  </div>
                  <div className="mt-[8px]">
                    <Badge tone="neutral">{goal.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
