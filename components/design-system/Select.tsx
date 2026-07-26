'use client';

import { useState } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Radix disallows an Item with value="" (that string is reserved to mean
// "cleared"). Optional foreign-key fields still need a real, selectable
// "None" option though (e.g. category_id left blank) — so empty-string
// option values are transparently swapped for this sentinel internally
// and back on the way out, exactly like a native <select><option value="">.
const EMPTY_VALUE_SENTINEL = '__none__';

/**
 * Custom select — a Radix Select (button trigger + portaled listbox)
 * rather than a native <select>, so the open list can be styled instead
 * of falling back to OS chrome. Pass `name` exactly like a native select
 * — a hidden input mirrors the selected value so it still participates
 * in native <form action={...}> submissions untouched.
 */
export function Select({
  options,
  placeholder = 'Selecciona una opcion',
  className,
  triggerClassName,
  disabled,
  id,
  name,
  required,
  defaultValue,
  value,
  onValueChange,
  'aria-invalid': ariaInvalid,
}: {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  'aria-invalid'?: boolean;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? value : internalValue;

  function handleChange(next: string) {
    const resolved = next === EMPTY_VALUE_SENTINEL ? '' : next;
    if (!isControlled) setInternalValue(resolved);
    onValueChange?.(resolved);
  }

  return (
    <SelectPrimitive.Root
      value={isControlled ? (value ? value : EMPTY_VALUE_SENTINEL) : undefined}
      defaultValue={!isControlled && defaultValue !== undefined ? defaultValue || EMPTY_VALUE_SENTINEL : undefined}
      onValueChange={handleChange}
      disabled={disabled}
      required={required}
    >
      {name && <input type="hidden" name={name} value={currentValue} required={required} />}
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={ariaInvalid}
        className={cn(
          'flex h-[44px] w-full items-center justify-between gap-[8px] rounded-[var(--ds-radius-md)] border bg-[var(--ds-color-surface)]',
          'border-[var(--ds-neutral-300)] px-[16px] text-[15px] text-[var(--ds-neutral-900)]',
          'transition-[border-color,box-shadow] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
          'focus:outline-none focus:border-[var(--ds-color-primary)] focus:shadow-[var(--ds-shadow-focus)]',
          'disabled:bg-[var(--ds-neutral-100)] disabled:text-[var(--ds-neutral-500)] disabled:cursor-not-allowed',
          'data-[placeholder]:text-[var(--ds-neutral-400)]',
          'aria-[invalid=true]:border-[var(--ds-color-danger)]',
          triggerClassName ?? className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <Icon icon={ChevronDown} size="sm" className="text-[var(--ds-neutral-400)]" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            'ds-popover-in z-50 overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] bg-[var(--ds-color-surface)]',
            'shadow-[var(--ds-shadow-md)] w-[var(--radix-select-trigger-width)]',
          )}
        >
          <SelectPrimitive.Viewport className="p-[4px]">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value === '' ? EMPTY_VALUE_SENTINEL : option.value}
                disabled={option.disabled}
                className={cn(
                  'font-display flex cursor-pointer items-center justify-between rounded-[var(--ds-radius-sm)] px-[10px] py-[8px] text-[15px]',
                  'text-[var(--ds-neutral-800)] outline-none transition-colors duration-[var(--ds-duration-instant)]',
                  'data-[highlighted]:bg-[var(--ds-neutral-50)]',
                  'data-[state=checked]:font-medium data-[state=checked]:text-[var(--ds-color-primary)]',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Icon icon={Check} size="xs" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
