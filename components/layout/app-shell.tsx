'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { LogOut, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/design-system/Icon';
import { Tooltip } from '@/components/design-system/Tooltip';
import { CommandPalette } from '@/components/design-system/CommandPalette';
import { SidebarNav } from './sidebar-nav';
import { MobileTopbar } from './mobile-topbar';
import { PageTransition } from './page-transition';

const STORAGE_KEY = 'atlas-sidebar-expanded';

const sidebarStore = {
  subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  },
  getSnapshot() {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  },
  getServerSnapshot() {
    return false;
  },
  set(next: boolean) {
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  },
};

export function AppShell({ unreadAlertsCount, children }: { unreadAlertsCount: number; children: React.ReactNode }) {
  const expanded = useSyncExternalStore(sidebarStore.subscribe, sidebarStore.getSnapshot, sidebarStore.getServerSnapshot);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function toggle() {
    sidebarStore.set(!expanded);
  }

  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--ds-color-background)] md:flex">
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-[var(--ds-neutral-100)] py-[24px] md:flex',
          'transition-[width] duration-[var(--ds-duration-base)] ease-[var(--ds-ease-standard)]',
          hydrated ? (expanded ? 'w-[240px] px-[16px]' : 'w-[72px] px-[12px]') : 'w-[72px] px-[12px]',
        )}
      >
        <Link
          href="/"
          className={cn(
            'font-display mb-[16px] flex h-[32px] items-center text-[17px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]',
            expanded ? 'px-[10px]' : 'justify-center',
          )}
        >
          {expanded ? 'ATLAS' : 'A'}
        </Link>

        <div className="mb-[16px]">
          <Tooltip label="Buscar (⌘K)" disabled={expanded}>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className={cn(
                'flex items-center rounded-[var(--ds-radius-md)] text-[13px] text-[var(--ds-neutral-400)] hover:bg-[var(--ds-neutral-50)] hover:text-[var(--ds-neutral-700)]',
                expanded ? 'h-[36px] w-full justify-between px-[10px]' : 'h-[36px] w-[36px] justify-center',
              )}
            >
              <span className="flex items-center gap-[10px]">
                <Icon icon={Search} size="sm" />
                {expanded && <span className="font-display">Buscar</span>}
              </span>
              {expanded && <span className="font-display text-[11px] text-[var(--ds-neutral-400)]">⌘K</span>}
            </button>
          </Tooltip>
        </div>

        <div className="flex flex-1 flex-col">
          <SidebarNav unreadAlertsCount={unreadAlertsCount} expanded={expanded} />
        </div>

        <div className={cn('flex flex-col gap-[2px] border-t border-[var(--ds-neutral-100)] pt-[16px]', !expanded && 'items-center')}>
          <form action={logout} className="contents">
            <Tooltip label="Salir" disabled={expanded}>
              <button
                type="submit"
                className={cn(
                  'rounded-[var(--ds-radius-md)] text-[14px] text-[var(--ds-neutral-500)] hover:bg-[var(--ds-neutral-50)]',
                  expanded ? 'w-full px-[10px] py-[8px] text-left' : 'flex h-[40px] w-[40px] items-center justify-center',
                )}
              >
                {expanded ? 'Salir' : <Icon icon={LogOut} size="sm" />}
              </button>
            </Tooltip>
          </form>
          <Tooltip label={expanded ? 'Contraer' : 'Expandir'} disabled={false}>
            <button
              type="button"
              onClick={toggle}
              aria-label={expanded ? 'Contraer navegacion' : 'Expandir navegacion'}
              className={cn(
                'flex h-[40px] items-center rounded-[var(--ds-radius-md)] text-[var(--ds-neutral-400)] hover:bg-[var(--ds-neutral-50)] hover:text-[var(--ds-neutral-700)]',
                expanded ? 'w-full justify-start gap-[10px] px-[10px]' : 'w-[40px] justify-center',
              )}
            >
              <Icon icon={expanded ? PanelLeftClose : PanelLeftOpen} size="sm" />
              {expanded && <span className="font-display text-[13px]">Contraer</span>}
            </button>
          </Tooltip>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <MobileTopbar unreadAlertsCount={unreadAlertsCount} onSearchClick={() => setPaletteOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-[20px] py-[24px] md:px-[48px] md:py-[40px]">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
