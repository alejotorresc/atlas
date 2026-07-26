import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
