import { redirect } from 'next/navigation';
import { getProfile } from '@/features/profile/queries';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (profile?.onboarding_completed) {
    redirect('/');
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-[16px] py-[40px]">
      <div className="mb-[24px] text-center">
        <span className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">ATLAS</span>
        <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">Configuremos tu cuenta</p>
      </div>
      <div className="rounded-[var(--ds-radius-xl)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-[24px] shadow-[var(--ds-shadow-sm)]">
        {children}
      </div>
    </div>
  );
}
