import { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Label({ className, required, children, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('block text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-700)] mb-[8px]', className)} {...props}>
      {children}
      {required && (
        <span className="text-[var(--ds-color-danger-text)] ml-[4px]" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

export function HelperText({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'danger' }) {
  return (
    <p
      className={cn(
        'mt-[8px] text-[13px]',
        tone === 'danger' ? 'text-[var(--ds-color-danger-text)]' : 'text-[var(--ds-neutral-500)]',
      )}
      role={tone === 'danger' ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}

export function FormField({
  label,
  required,
  helperText,
  error,
  htmlFor,
  children,
}: {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? <HelperText tone="danger">{error}</HelperText> : helperText ? <HelperText>{helperText}</HelperText> : null}
    </div>
  );
}
