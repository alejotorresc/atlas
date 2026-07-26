import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/finance/money';

export type NumericTone = 'neutral' | 'positive' | 'negative';

const SIZE_CLASS = {
  display: 'font-display text-[40px] leading-[46px] font-medium tracking-[-0.01em]',
  numericDisplay: 'font-display text-[34px] leading-[40px] font-medium tracking-[-0.02em]',
  numericBody: 'text-[15px] leading-[22px] font-medium',
  small: 'text-[13px] leading-[18px] font-medium',
} as const;

const TONE_CLASS: Record<NumericTone, string> = {
  neutral: 'text-[var(--ds-neutral-900)]',
  positive: 'text-[var(--ds-color-success-text)]',
  negative: 'text-[var(--ds-color-danger-text)]',
};

/**
 * Renders a monetary amount using the real formatCurrency (the same
 * function every screen in the app uses), with tabular figures so digits
 * align in tables and don't shift as values update. Sign coloring is
 * opt-in via `tone` — most amounts should stay neutral; only call out
 * gains/losses where that distinction is the point (e.g. a refund list).
 */
export function NumericDisplay({
  amountMinor,
  currency = 'GTQ',
  size = 'numericBody',
  tone = 'neutral',
  showSign = false,
  className,
}: {
  amountMinor: number;
  currency?: string;
  size?: keyof typeof SIZE_CLASS;
  tone?: NumericTone;
  showSign?: boolean;
  className?: string;
}) {
  const formatted = formatCurrency(Math.abs(amountMinor), currency);
  const sign = showSign ? (amountMinor < 0 ? '-' : '+') : amountMinor < 0 ? '-' : '';

  return (
    <span className={cn('tabular-nums', SIZE_CLASS[size], TONE_CLASS[tone], className)}>
      {sign}
      {formatted}
    </span>
  );
}
