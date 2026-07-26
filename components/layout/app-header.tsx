import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { NavLinks } from './nav-links';
import { MobileNav } from './mobile-nav';
import { Button } from '@/components/ui/button';

export function AppHeader({ unreadAlertsCount }: { unreadAlertsCount: number }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ATLAS
        </Link>
        <NavLinks className="hidden md:block" />
        <div className="flex items-center gap-3">
          <Link href="/transactions?new=1">
            <Button variant="primary" className="hidden sm:inline-flex">
              Registrar movimiento
            </Button>
          </Link>
          <Link
            href="/alerts"
            className="relative rounded-md border border-slate-300 px-3 py-2 text-sm"
            aria-label={`Alertas (${unreadAlertsCount} sin leer)`}
          >
            Alertas
            {unreadAlertsCount > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
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
