import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

const TOAST_ICON = { success: CheckCircle2, info: Info, warning: TriangleAlert, danger: XCircle } as const;

/**
 * Toast — a single transient confirmation. Enters with dialogEnter timing,
 * leaves with the faster toastExit timing (see lib/design-tokens/motion.ts).
 * This is the static/rendered form for the style guide; a real toast
 * manager would mount/unmount this with those durations.
 */
export function Toast({ tone = 'success', message }: { tone?: keyof typeof TOAST_ICON; message: string }) {
  const toneClass = {
    success: 'text-[var(--ds-color-success)]',
    info: 'text-[var(--ds-color-info)]',
    warning: 'text-[var(--ds-color-warning)]',
    danger: 'text-[var(--ds-color-danger)]',
  }[tone];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-[12px] rounded-[var(--ds-radius-lg)] bg-[var(--ds-neutral-900)] px-[16px] py-[12px] text-[13px] text-white shadow-[var(--ds-shadow-lg)]',
      )}
    >
      <Icon icon={TOAST_ICON[tone]} size="sm" className={toneClass} />
      {message}
    </div>
  );
}
