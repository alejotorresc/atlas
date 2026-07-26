import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { getProfile } from '@/features/profile/queries';
import { getUnreadAlertsCount } from '@/features/alerts/queries';
import { AppHeader } from '@/components/layout/app-header';

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

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader unreadAlertsCount={unreadAlertsCount} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
