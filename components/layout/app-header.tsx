import Link from 'next/link';
import { Bell } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import { NavLinks } from './nav-links';
import { MobileNav } from './mobile-nav';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/design-system/Icon';

export function AppHeader({ unreadAlertsCount }: { unreadAlertsCount: number }) {
  return (
    <header className="border-b border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-[16px] px-[16px] py-[12px]">
        <Link href="/" className="text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
          ATLAS
        </Link>
        <NavLinks className="hidden md:block" />
        <div className="flex items-center gap-[12px]">
          <Link href="/transactions?new=1">
            <Button variant="primary" className="hidden sm:inline-flex">
              Registrar movimiento
            </Button>
          </Link>
          <Link
            href="/alerts"
            className="relative inline-flex items-center gap-[8px] rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] px-[12px] py-[8px] text-[13px] text-[var(--ds-neutral-700)] hover:bg-[var(--ds-neutral-50)]"
            aria-label={`Alertas (${unreadAlertsCount} sin leer)`}
          >
            <Icon icon={Bell} size="sm" />
            <span className="hidden sm:inline">Alertas</span>
            {unreadAlertsCount > 0 && (
              <span className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-color-danger)] px-[6px] py-[1px] text-[12px] font-medium text-white">
                {unreadAlertsCount}
              </span>
            )}
          </Link>
          <form action={logout}>
            <Button type="submit" variant="ghost">
              Salir
            </Button>
          </form>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
