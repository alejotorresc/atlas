import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { SidebarNav } from './sidebar-nav';
import { MobileTopbar } from './mobile-topbar';

export function AppShell({ unreadAlertsCount, children }: { unreadAlertsCount: number; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ds-color-background)] md:flex">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[var(--ds-neutral-100)] px-[16px] py-[24px] md:flex">
        <Link href="/" className="mb-[32px] px-[10px] text-[17px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
          ATLAS
        </Link>
        <div className="flex flex-1 flex-col">
          <SidebarNav unreadAlertsCount={unreadAlertsCount} />
        </div>
        <form action={logout} className="border-t border-[var(--ds-neutral-100)] pt-[16px]">
          <button type="submit" className="w-full rounded-[var(--ds-radius-md)] px-[10px] py-[8px] text-left text-[14px] text-[var(--ds-neutral-500)] hover:bg-[var(--ds-neutral-50)]">
            Salir
          </button>
        </form>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <MobileTopbar unreadAlertsCount={unreadAlertsCount} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-[16px] py-[32px] md:px-[48px] md:py-[48px]">{children}</main>
      </div>
    </div>
  );
}
