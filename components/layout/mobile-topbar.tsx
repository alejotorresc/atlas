'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import { SidebarNav } from './sidebar-nav';
import { Icon } from '@/components/design-system/Icon';

export function MobileTopbar({ unreadAlertsCount }: { unreadAlertsCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <header className="flex items-center justify-between border-b border-[var(--ds-neutral-100)] bg-[var(--ds-color-surface)] px-[16px] py-[12px]">
        <Link href="/" className="text-[17px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">
          ATLAS
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label="Abrir navegacion"
          onClick={() => setOpen(true)}
          className="flex h-[40px] w-[40px] items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-neutral-600)]"
        >
          <Icon icon={Menu} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            id="mobile-nav-panel"
            className="relative flex h-full w-[280px] flex-col gap-[24px] bg-[var(--ds-color-surface)] px-[16px] py-[16px] shadow-[var(--ds-shadow-lg)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">ATLAS</span>
              <button
                type="button"
                aria-label="Cerrar navegacion"
                onClick={() => setOpen(false)}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-neutral-600)]"
              >
                <Icon icon={X} size="sm" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav unreadAlertsCount={unreadAlertsCount} onNavigate={() => setOpen(false)} />
            </div>
            <form action={logout}>
              <button type="submit" className="w-full rounded-[var(--ds-radius-md)] px-[10px] py-[8px] text-left text-[14px] text-[var(--ds-neutral-500)]">
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
