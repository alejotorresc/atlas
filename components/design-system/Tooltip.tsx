'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const SIDE_CLASS = {
  right: 'left-full top-1/2 ml-[8px] -translate-y-1/2',
  top: 'bottom-full left-1/2 mb-[8px] -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-[8px] -translate-x-1/2',
} as const;

/**
 * Minimal hover/focus tooltip — no portal, no dependency. Positioned
 * relative to its trigger, so the trigger's nearest positioned ancestor
 * must not clip overflow (e.g. the sidebar rail).
 */
export function Tooltip({
  label,
  children,
  side = 'right',
  disabled,
}: {
  label: string;
  children: ReactNode;
  side?: keyof typeof SIDE_CLASS;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  if (disabled) return <>{children}</>;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'font-display pointer-events-none absolute z-50 whitespace-nowrap rounded-[var(--ds-radius-sm)]',
          'bg-[var(--ds-neutral-900)] px-[8px] py-[4px] text-[12px] font-medium text-white',
          'transition-[opacity,transform] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
          visible ? 'opacity-100' : 'opacity-0 scale-95',
          SIDE_CLASS[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
