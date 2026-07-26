import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getSavingsGoal, listGoalContributions } from '@/features/savings/queries';
import { listAccounts } from '@/features/accounts/queries';
import { formatCurrency } from '@/lib/finance/money';
import { formatDateGT } from '@/lib/dates/format';
import { savingsProgressRatio } from '@/lib/finance/savings-pace';
import { Card, CardTitle, CardValue } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoalDetailActions } from './goal-detail-actions';

export default async function SavingsGoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const goal = await getSavingsGoal(user.id, id);
  if (!goal) notFound();

  const [contributions, accounts] = await Promise.all([listGoalContributions(user.id, id), listAccounts(user.id)]);
  const progress = savingsProgressRatio(goal.current_amount_minor, goal.target_amount_minor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{goal.name}</h1>
          <Badge tone="neutral">{goal.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Ahorrado</CardTitle>
          <CardValue>{formatCurrency(goal.current_amount_minor, goal.currency)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Objetivo</CardTitle>
          <CardValue>{formatCurrency(goal.target_amount_minor, goal.currency)}</CardValue>
        </Card>
        <Card>
          <CardTitle>Progreso</CardTitle>
          <CardValue>{(progress * 100).toFixed(0)}%</CardValue>
        </Card>
      </div>

      {goal.target_date && <p className="text-sm text-slate-600">Fecha objetivo: {formatDateGT(goal.target_date)}</p>}

      <GoalDetailActions goal={goal} accounts={accounts.filter((a) => !a.is_archived)} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Historial de aportes y retiros</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Sin movimientos todavia.
                  </td>
                </tr>
              )}
              {contributions.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{formatDateGT(c.created_at.slice(0, 10))}</td>
                  <td className="px-4 py-2">{c.contribution_type === 'contribution' ? 'Aporte' : 'Retiro'}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(c.amount_minor, goal.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
