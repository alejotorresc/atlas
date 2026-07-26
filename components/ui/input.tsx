import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900',
        'disabled:bg-slate-100 disabled:text-slate-500',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
