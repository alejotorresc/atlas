import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listSavingsGoals } from '@/features/savings/queries';
import { listAccounts } from '@/features/accounts/queries';
import { formatCurrency } from '@/lib/finance/money';
import { savingsProgressRatio, calculateSavingsPace } from '@/lib/finance/savings-pace';
import { formatDateGT } from '@/lib/dates/format';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ahorros</h1>
        <NewSavingsGoalButton accounts={accounts.filter((a) => !a.is_archived)} />
      </div>

      <Card className="max-w-xs">
        <CardTitle>Total ahorrado</CardTitle>
        <CardValue>{formatCurrency(totalSaved)}</CardValue>
      </Card>

      {active.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--ds-neutral-600)]">Aun no tienes metas de ahorro activas.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((goal) => {
            const progress = savingsProgressRatio(goal.current_amount_minor, goal.target_amount_minor);
            const pace = goal.target_date
              ? calculateSavingsPace(goal.current_amount_minor, goal.target_amount_minor, new Date(goal.target_date), today, 1)
              : null;

            return (
              <Link key={goal.id} href={`/savings/${goal.id}`}>
                <Card className="h-full hover:border-[var(--ds-neutral-400)]">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{goal.name}</p>
                    <Badge tone={goal.priority === 'high' ? 'danger' : goal.priority === 'medium' ? 'warning' : 'neutral'}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--ds-neutral-600)]">
                    {formatCurrency(goal.current_amount_minor, goal.currency)} de {formatCurrency(goal.target_amount_minor, goal.currency)}
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-[var(--ds-neutral-100)]">
                    <div className="h-2 rounded-full bg-[var(--ds-color-primary)]" style={{ width: `${progress * 100}%` }} />
                  </div>
                  {goal.target_date && (
                    <p className="mt-2 text-xs text-[var(--ds-neutral-500)]">Meta: {formatDateGT(goal.target_date)}</p>
                  )}
                  {pace && (
                    <p className="mt-1 text-xs text-[var(--ds-neutral-500)]">
                      Sugerido: {formatCurrency(pace.suggestedMonthlyContributionMinor, goal.currency)}/mes ·{' '}
                      <Badge tone={pace.status === 'behind' ? 'danger' : pace.status === 'ahead' ? 'success' : 'info'}>
                        {pace.status}
                      </Badge>
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {completedOrPaused.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-[var(--ds-neutral-500)]">Completadas / pausadas / canceladas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedOrPaused.map((goal) => (
              <Link key={goal.id} href={`/savings/${goal.id}`}>
                <Card className="opacity-70 hover:opacity-100">
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm text-[var(--ds-neutral-500)]">{formatCurrency(goal.current_amount_minor, goal.currency)}</p>
                  <Badge tone="neutral">{goal.status}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
