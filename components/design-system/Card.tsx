import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Base surface for every card pattern in ATLAS. A resting card has no
 * shadow and only a hairline border — grouping comes from whitespace, not
 * elevation. Interactive cards pick up a near-invisible shadow only on
 * hover, as the one moment elevation is load-bearing (confirming the
 * element is actionable). Selected cards get a primary border instead of
 * a shadow change — a shadow alone is too subtle to read as "selected."
 */
const cardVariants = cva('rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] border border-[var(--ds-neutral-200)] p-[16px]', {
  variants: {
    state: {
      resting: '',
      interactive:
        'cursor-pointer transition-[box-shadow,transform] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)] hover:-translate-y-[1px] hover:shadow-[var(--ds-shadow-xs)]',
      selected: 'border-[var(--ds-color-primary)] border-2',
      disabled: 'opacity-50 pointer-events-none',
    },
  },
  defaultVariants: { state: 'resting' },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ state, className, ...props }: CardProps) {
  return <div className={cn(cardVariants({ state, className }))} {...props} />;
}

export function CardEmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-[8px] py-[32px] text-center">
      {icon && <div className="text-[var(--ds-neutral-400)]">{icon}</div>}
      <p className="text-[15px] font-medium text-[var(--ds-neutral-800)]">{title}</p>
      <p className="max-w-[280px] text-[13px] text-[var(--ds-neutral-500)]">{description}</p>
      {action}
    </div>
  );
}

export function CardLoadingState() {
  return (
    <div className="space-y-[12px]" aria-busy="true" aria-label="Cargando">
      <div className="h-[16px] w-2/3 animate-pulse rounded-[var(--ds-radius-sm)] bg-[var(--ds-neutral-200)]" />
      <div className="h-[16px] w-1/2 animate-pulse rounded-[var(--ds-radius-sm)] bg-[var(--ds-neutral-200)]" />
      <div className="h-[16px] w-5/6 animate-pulse rounded-[var(--ds-radius-sm)] bg-[var(--ds-neutral-200)]" />
    </div>
  );
}
