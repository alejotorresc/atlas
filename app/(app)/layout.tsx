import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getProfile } from '@/features/profile/queries';
import { getUnreadAlertsCount } from '@/features/alerts/queries';
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

  const unreadAlertsCount = await getUnreadAlertsCount(user.id);

  return <AppShell unreadAlertsCount={unreadAlertsCount}>{children}</AppShell>;
}
