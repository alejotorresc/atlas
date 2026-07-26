'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/transactions', label: 'Movimientos' },
  { href: '/calendar', label: 'Calendario' },
  { href: '/accounts', label: 'Cuentas' },
  { href: '/cards', label: 'Tarjetas' },
  { href: '/budgets', label: 'Presupuestos' },
  { href: '/savings', label: 'Ahorros' },
  { href: '/reports', label: 'Reportes' },
  { href: '/settings', label: 'Configuracion' },
];

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Navegacion principal">
      <ul className="flex flex-col gap-1 md:flex-row md:gap-4">
        {LINKS.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-[var(--ds-radius-md)] px-[12px] py-[8px] text-[13px] font-medium',
                  'transition-colors duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
                  active
                    ? 'bg-[var(--ds-color-primary)] text-white'
                    : 'text-[var(--ds-neutral-700)] hover:bg-[var(--ds-neutral-100)]',
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
