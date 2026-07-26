'use client';

import { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

const triggerClass = cn(
  'flex h-[44px] w-full items-center justify-between gap-[8px] rounded-[var(--ds-radius-md)] border bg-[var(--ds-color-surface)]',
  'border-[var(--ds-neutral-300)] px-[16px] text-[15px] text-[var(--ds-neutral-900)] text-left',
  'transition-[border-color,box-shadow] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
  'focus:outline-none focus:border-[var(--ds-color-primary)] focus:shadow-[var(--ds-shadow-focus)]',
  'disabled:bg-[var(--ds-neutral-100)] disabled:text-[var(--ds-neutral-500)] disabled:cursor-not-allowed',
  'aria-[invalid=true]:border-[var(--ds-color-danger)]',
);

/**
 * Searchable single-select — a Radix Popover + cmdk Command, rather than
 * a native <select> or a plain (non-searchable) custom select. Meant for
 * lists long/varied enough that scanning beats typing-to-jump (accounts,
 * cards, categories, savings goals). Renders a hidden input under `name`
 * so it still participates in native <form action={...}> submissions.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecciona una opcion',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Sin resultados.',
  name,
  id,
  disabled,
  className,
  'aria-invalid': ariaInvalid,
}: {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverPrimitive.Trigger asChild>
        <button type="button" id={id} disabled={disabled} aria-invalid={ariaInvalid} className={cn(triggerClass, className)}>
          <span className={cn('truncate', !selected && 'text-[var(--ds-neutral-400)]')}>{selected ? selected.label : placeholder}</span>
          <Icon icon={ChevronDown} size="sm" className="shrink-0 text-[var(--ds-neutral-400)]" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={4}
          align="start"
          className="ds-popover-in z-[160] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-md)]"
        >
          <Command loop>
            <div className="flex items-center gap-[8px] border-b border-[var(--ds-neutral-100)] px-[12px]">
              <Icon icon={Search} size="xs" className="text-[var(--ds-neutral-400)]" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="h-[40px] w-full bg-transparent text-[14px] text-[var(--ds-neutral-900)] placeholder:text-[var(--ds-neutral-400)] focus:outline-none"
              />
            </div>
            <Command.List className="max-h-[240px] overflow-y-auto p-[4px]">
              <Command.Empty className="px-[12px] py-[16px] text-center text-[13px] text-[var(--ds-neutral-500)]">
                {emptyMessage}
              </Command.Empty>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'font-display flex cursor-pointer items-center justify-between rounded-[var(--ds-radius-sm)] px-[10px] py-[8px] text-[14px]',
                    'text-[var(--ds-neutral-800)] outline-none data-[selected=true]:bg-[var(--ds-neutral-50)]',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && <Icon icon={Check} size="xs" className="shrink-0 text-[var(--ds-color-primary)]" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
