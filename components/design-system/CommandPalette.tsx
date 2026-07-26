'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
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
  CirclePlus,
  Search,
} from 'lucide-react';
import { Icon } from './Icon';

const NAV_ITEMS = [
  { label: 'Resumen', href: '/', icon: LayoutGrid },
  { label: 'Actividad', href: '/transactions', icon: Receipt },
  { label: 'Calendario', href: '/calendar', icon: Calendar },
  { label: 'Cuentas', href: '/accounts', icon: Landmark },
  { label: 'Tarjetas', href: '/cards', icon: CreditCard },
  { label: 'Ahorros', href: '/savings', icon: PiggyBank },
  { label: 'Presupuestos', href: '/budgets', icon: Wallet },
  { label: 'Reportes', href: '/reports', icon: BarChart3 },
  { label: 'Notificaciones', href: '/alerts', icon: Bell },
  { label: 'Configuracion', href: '/settings', icon: Settings },
];

const ACTION_ITEMS = [
  { label: 'Registrar movimiento', href: '/transactions?new=1' },
  { label: 'Nueva cuenta', href: '/accounts' },
  { label: 'Nueva tarjeta', href: '/cards' },
  { label: 'Nueva meta de ahorro', href: '/savings' },
  { label: 'Nuevo presupuesto', href: '/budgets' },
];

/**
 * Global command palette (Cmd/Ctrl+K) — jump to any section or start a
 * common action without leaving the keyboard. Built on cmdk (the same
 * accessible foundation behind Linear/Vercel-style palettes) rather than
 * hand-rolled arrow-key/filtering logic.
 */
export function CommandPalette({ open: openProp, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const router = useRouter();

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Paleta de comandos"
      overlayClassName="fixed inset-0 z-[200] bg-black/20"
      contentClassName="ds-popover-in fixed left-1/2 top-[15vh] z-[201] w-[560px] max-w-[calc(100vw-32px)] -translate-x-1/2 overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-lg)] focus:outline-none"
      shouldFilter
    >
      <div className="flex items-center gap-[10px] border-b border-[var(--ds-neutral-100)] px-[16px]">
        <Icon icon={Search} size="sm" className="text-[var(--ds-neutral-400)]" />
        <Command.Input
          placeholder="Buscar o saltar a..."
          className="h-[52px] w-full bg-transparent text-[15px] text-[var(--ds-neutral-900)] placeholder:text-[var(--ds-neutral-400)] focus:outline-none"
        />
      </div>
      <Command.List className="max-h-[360px] overflow-y-auto p-[8px]">
        <Command.Empty className="px-[12px] py-[24px] text-center text-[13px] text-[var(--ds-neutral-500)]">
          Sin resultados.
        </Command.Empty>

        <Command.Group heading="Navegar" className="[&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:px-[10px] [&_[cmdk-group-heading]]:py-[8px] [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.02em] [&_[cmdk-group-heading]]:text-[var(--ds-neutral-500)]">
          {NAV_ITEMS.map((item) => (
            <Command.Item
              key={item.href}
              value={item.label}
              onSelect={() => go(item.href)}
              className="font-display flex cursor-pointer items-center gap-[10px] rounded-[var(--ds-radius-sm)] px-[10px] py-[10px] text-[14px] text-[var(--ds-neutral-800)] outline-none data-[selected=true]:bg-[var(--ds-neutral-50)]"
            >
              <Icon icon={item.icon} size="sm" className="text-[var(--ds-neutral-400)]" />
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Acciones" className="[&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:px-[10px] [&_[cmdk-group-heading]]:py-[8px] [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.02em] [&_[cmdk-group-heading]]:text-[var(--ds-neutral-500)]">
          {ACTION_ITEMS.map((item) => (
            <Command.Item
              key={item.href}
              value={item.label}
              onSelect={() => go(item.href)}
              className="font-display flex cursor-pointer items-center gap-[10px] rounded-[var(--ds-radius-sm)] px-[10px] py-[10px] text-[14px] text-[var(--ds-neutral-800)] outline-none data-[selected=true]:bg-[var(--ds-neutral-50)]"
            >
              <Icon icon={CirclePlus} size="sm" className="text-[var(--ds-neutral-400)]" />
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
