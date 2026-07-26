import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getProfile } from '@/features/profile/queries';
import { getUnreadAlertsCount } from '@/features/alerts/queries';
import { listAccounts } from '@/features/accounts/queries';
import { listCards } from '@/features/cards/queries';
import { listCategories } from '@/features/categories/queries';
import { listSavingsGoals } from '@/features/savings/queries';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile();
  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  const [unreadAlertsCount, accounts, cards, incomeCategories, expenseCategories, savingsGoals] = await Promise.all([
    getUnreadAlertsCount(user.id),
    listAccounts(user.id),
    listCards(user.id),
    listCategories(user.id, 'income'),
    listCategories(user.id, 'expense'),
    listSavingsGoals(user.id),
  ]);

  return (
    <AppShell
      unreadAlertsCount={unreadAlertsCount}
      quickExpenseProps={{
        accounts: accounts.filter((a) => !a.is_archived),
        cards: cards.filter((c) => !c.is_archived),
        incomeCategories,
        expenseCategories,
        savingsGoals: savingsGoals.filter((g) => g.status === 'active'),
      }}
    >
      {children}
    </AppShell>
  );
}
