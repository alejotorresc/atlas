import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-[4px] rounded-[var(--ds-radius-pill)] px-[10px] h-[24px] text-[12px] font-medium', {
  variants: {
    tone: {
      neutral: 'bg-[var(--ds-neutral-100)] text-[var(--ds-neutral-700)]',
      primary: 'bg-[var(--ds-color-primary-subtle)] text-[var(--ds-color-primary)]',
      success: 'bg-[var(--ds-color-success-subtle)] text-[var(--ds-color-success)]',
      warning: 'bg-[var(--ds-color-warning-subtle)] text-[var(--ds-color-warning)]',
      danger: 'bg-[var(--ds-color-danger-subtle)] text-[var(--ds-color-danger)]',
      info: 'bg-[var(--ds-color-info-subtle)] text-[var(--ds-color-info)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
