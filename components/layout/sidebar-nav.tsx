'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Receipt,
  Calendar,
  Landmark,
  CreditCard,
  PiggyBank,
  Wallet,
  BarChart3,
  Settings,
  Bell,
  CircleUser,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/design-system/Icon';

const PRIMARY_LINKS = [
  { href: '/', label: 'Resumen', icon: LayoutGrid },
  { href: '/transactions', label: 'Actividad', icon: Receipt },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/accounts', label: 'Cuentas', icon: Landmark },
  { href: '/cards', label: 'Tarjetas', icon: CreditCard },
  { href: '/savings', label: 'Ahorros', icon: PiggyBank },
  { href: '/budgets', label: 'Presupuestos', icon: Wallet },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
];

const SECONDARY_LINKS = [
  { href: '/settings', label: 'Configuracion', icon: Settings },
  { href: '/alerts', label: 'Notificaciones', icon: Bell },
  { href: '/settings#perfil', label: 'Perfil', icon: CircleUser },
];

function isActive(pathname: string, href: string) {
  const path = href.split('#')[0];
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItem({
  href,
  label,
  icon,
  active,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-[10px] rounded-[var(--ds-radius-md)] px-[10px] py-[8px] text-[14px]',
        'transition-colors duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
        active
          ? 'bg-[var(--ds-color-primary-subtle)] font-medium text-[var(--ds-color-primary-pressed)]'
          : 'text-[var(--ds-neutral-600)] hover:bg-[var(--ds-neutral-50)] hover:text-[var(--ds-neutral-900)]',
      )}
    >
      <Icon icon={icon} size="sm" className={active ? 'text-[var(--ds-color-primary)]' : 'text-[var(--ds-neutral-400)]'} />
      <span className="flex-1">{label}</span>
      {!!badge && (
        <span className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-color-danger)] px-[6px] py-[1px] text-[11px] font-medium text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({ unreadAlertsCount, onNavigate }: { unreadAlertsCount?: number; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacion principal" className="flex h-full flex-col gap-[24px]">
      <ul className="flex flex-col gap-[2px]">
        {PRIMARY_LINKS.map((link) => (
          <li key={link.href}>
            <NavItem {...link} active={isActive(pathname, link.href)} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-[2px] border-t border-[var(--ds-neutral-100)] pt-[16px]">
        {SECONDARY_LINKS.map((link) => (
          <NavItem
            key={link.href}
            {...link}
            active={isActive(pathname, link.href)}
            badge={link.href === '/alerts' ? unreadAlertsCount : undefined}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}
