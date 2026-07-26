'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/**
 * Custom checkbox — a Radix Checkbox (button role="checkbox") rather than
 * a native <input type="checkbox">, so it can be styled without fighting
 * OS defaults. Pass `name` (and optionally `value`) exactly like a native
 * checkbox — Radix renders a hidden bubble input so it still participates
 * in native <form action={...}> submissions untouched.
 */
export function Checkbox({ className, ...props }: CheckboxPrimitive.CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[var(--ds-radius-sm)] border border-[var(--ds-neutral-300)] bg-[var(--ds-color-surface)]',
        'transition-colors duration-[var(--ds-duration-instant)] ease-[var(--ds-ease-standard)]',
        'data-[state=checked]:border-[var(--ds-color-primary)] data-[state=checked]:bg-[var(--ds-color-primary)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-white">
        <Icon icon={Check} size="xs" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/** Custom radio group — Radix RadioGroup, same native-form-compatible bubble input via `name` on the Root. */
export const RadioGroup = RadioGroupPrimitive.Root;

export function RadioGroupItem({ className, ...props }: RadioGroupPrimitive.RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border border-[var(--ds-neutral-300)] bg-[var(--ds-color-surface)]',
        'transition-colors duration-[var(--ds-duration-instant)] ease-[var(--ds-ease-standard)]',
        'data-[state=checked]:border-[var(--ds-color-primary)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="block h-[10px] w-[10px] rounded-full bg-[var(--ds-color-primary)]" />
    </RadioGroupPrimitive.Item>
  );
}

/** Custom switch — Radix Switch, for on/off preferences (not a checkbox semantically). */
export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative h-[28px] w-[48px] shrink-0 rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-300)]',
        'transition-colors duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
        'data-[state=checked]:bg-[var(--ds-color-primary)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block h-[22px] w-[22px] translate-x-[3px] rounded-full bg-white shadow-[var(--ds-shadow-xs)]',
          'transition-transform duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
          'data-[state=checked]:translate-x-[23px]',
        )}
      />
    </SwitchPrimitive.Root>
  );
}
