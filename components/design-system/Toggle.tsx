'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, id, ...props }, ref) => (
  <span className="relative inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center">
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        'peer h-[20px] w-[20px] appearance-none rounded-[var(--ds-radius-sm)] border border-[var(--ds-neutral-400)] bg-[var(--ds-color-surface)]',
        'checked:bg-[var(--ds-color-primary)] checked:border-[var(--ds-color-primary)]',
        'transition-colors duration-[var(--ds-duration-instant)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
    <Icon icon={Check} size="xs" className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100" />
  </span>
));
Checkbox.displayName = 'Checkbox';

export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <span className="relative inline-flex h-[20px] w-[20px] shrink-0 items-center justify-center">
    <input
      ref={ref}
      type="radio"
      className={cn(
        'peer h-[20px] w-[20px] appearance-none rounded-full border border-[var(--ds-neutral-400)] bg-[var(--ds-color-surface)]',
        'checked:border-[6px] checked:border-[var(--ds-color-primary)]',
        'transition-[border-width] duration-[var(--ds-duration-instant)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  </span>
));
Radio.displayName = 'Radio';

export const Switch = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <label className="relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center">
    <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
    <span
      className={cn(
        'absolute inset-0 rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-300)] transition-colors',
        'duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
        'peer-checked:bg-[var(--ds-color-primary)]',
        'peer-focus-visible:shadow-[var(--ds-shadow-focus)]',
        'peer-disabled:opacity-40',
        className,
      )}
    />
    <span
      className={cn(
        'absolute left-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[var(--ds-shadow-xs)] transition-transform',
        'duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
        'peer-checked:translate-x-[20px]',
      )}
    />
  </label>
));
Switch.displayName = 'Switch';
