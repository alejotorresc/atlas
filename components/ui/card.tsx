import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Re-exports the design-system Card — see components/ui/button.tsx for why. */
export { Card } from '@/components/design-system/Card';

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[13px] font-medium text-[var(--ds-neutral-500)]', className)} {...props} />;
}

/** Numeric card value — medium weight, tabular figures, matches the numericDisplay type tier. */
export function CardValue({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'mt-[4px] text-[28px] leading-[34px] font-medium tracking-[-0.01em] tabular-nums text-[var(--ds-neutral-900)]',
        className,
      )}
      {...props}
    />
  );
}
