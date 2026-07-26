'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

const baseInputClass = [
  'block w-full h-[44px] rounded-[var(--ds-radius-md)] border bg-[var(--ds-color-surface)]',
  'border-[var(--ds-neutral-300)] px-[16px] text-[15px] text-[var(--ds-neutral-900)]',
  'placeholder:text-[var(--ds-neutral-400)]',
  'transition-[border-color,box-shadow] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
  'focus:outline-none focus:border-[var(--ds-color-primary)] focus:shadow-[var(--ds-shadow-focus)]',
  'disabled:bg-[var(--ds-neutral-100)] disabled:text-[var(--ds-neutral-500)] disabled:cursor-not-allowed',
  'aria-[invalid=true]:border-[var(--ds-color-danger)]',
].join(' ');

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseInputClass, className)} {...props} />
));
Input.displayName = 'Input';

/** Currency input: right-aligned, tabular figures, fixed currency prefix. */
export const CurrencyInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { currencySymbol?: string }>(
  ({ className, currencySymbol = 'Q', ...props }, ref) => (
    <div className="relative">
      <span className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[15px] text-[var(--ds-neutral-500)]">
        {currencySymbol}
      </span>
      <input
        ref={ref}
        inputMode="decimal"
        className={cn(baseInputClass, 'pl-[36px] text-right tabular-nums', className)}
        {...props}
      />
    </div>
  ),
);
CurrencyInput.displayName = 'CurrencyInput';

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="relative">
    <Icon icon={Search} size="sm" className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--ds-neutral-400)]" />
    <input ref={ref} type="search" className={cn(baseInputClass, 'pl-[40px]', className)} {...props} />
  </div>
));
SearchInput.displayName = 'SearchInput';

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? 'text' : 'password'} className={cn(baseInputClass, 'pr-[44px]', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
        className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--ds-neutral-500)] hover:text-[var(--ds-neutral-800)]"
      >
        <Icon icon={visible ? EyeOff : Eye} size="sm" />
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full min-h-[96px] rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] bg-[var(--ds-color-surface)]',
        'px-[16px] py-[12px] text-[15px] text-[var(--ds-neutral-900)] placeholder:text-[var(--ds-neutral-400)]',
        'transition-[border-color,box-shadow] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
        'focus:outline-none focus:border-[var(--ds-color-primary)] focus:shadow-[var(--ds-shadow-focus)]',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(baseInputClass, 'appearance-none pr-[40px]', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
