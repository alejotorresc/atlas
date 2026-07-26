'use client';

import { cn } from '@/lib/utils';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  name,
}: {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)] p-[4px]"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            name={name}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[var(--ds-radius-pill)] px-[16px] h-[36px] text-[13px] font-medium',
              'transition-[background-color,color] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
              'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
              active
                ? 'bg-[var(--ds-color-surface)] text-[var(--ds-neutral-900)] shadow-[var(--ds-shadow-xs)]'
                : 'text-[var(--ds-neutral-600)] hover:text-[var(--ds-neutral-900)]',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
