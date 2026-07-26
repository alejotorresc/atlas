import { cn } from '@/lib/utils';

/**
 * Small horizontal progress meter — the utilization/progress-bar pattern
 * used across card and budget screens, extracted into one component now
 * that debt-analysis needs three more instances of it.
 */
export function Meter({
  value,
  max = 100,
  tone = 'primary',
  className,
}: {
  value: number;
  max?: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);
  const toneClass =
    tone === 'danger'
      ? 'bg-[var(--ds-color-danger)]'
      : tone === 'warning'
        ? 'bg-[var(--ds-color-warning)]'
        : tone === 'success'
          ? 'bg-[var(--ds-color-success)]'
          : 'bg-[var(--ds-color-primary)]';

  return (
    <div className={cn('h-[6px] w-full rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)]', className)}>
      <div
        className={cn('h-[6px] rounded-[var(--ds-radius-pill)] transition-[width] duration-[var(--ds-duration-base)] ease-[var(--ds-ease-standard)]', toneClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
