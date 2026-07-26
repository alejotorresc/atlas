import { redirect } from 'next/navigation';
import { getProfile } from '@/features/profile/queries';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (profile?.onboarding_completed) {
    redirect('/');
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">ATLAS</span>
        <p className="mt-1 text-sm text-slate-500">Configuremos tu cuenta</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}
