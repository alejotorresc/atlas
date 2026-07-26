'use client';

import { useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { format, parseISO, addMonths, subMonths, startOfMonth, startOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const triggerClass = cn(
  'flex h-[44px] w-full items-center justify-between gap-[8px] rounded-[var(--ds-radius-md)] border bg-[var(--ds-color-surface)]',
  'border-[var(--ds-neutral-300)] px-[16px] text-[15px] text-[var(--ds-neutral-900)] text-left',
  'transition-[border-color,box-shadow] duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
  'focus:outline-none focus:border-[var(--ds-color-primary)] focus:shadow-[var(--ds-shadow-focus)]',
  'disabled:bg-[var(--ds-neutral-100)] disabled:text-[var(--ds-neutral-500)] disabled:cursor-not-allowed',
  'aria-[invalid=true]:border-[var(--ds-color-danger)]',
);

/**
 * Custom date picker — a Radix Popover with a hand-built calendar grid
 * (date-fns), rather than a native <input type="date">, so the calendar
 * itself is styled instead of falling back to OS chrome. Uncontrolled by
 * default (defaultValue), and renders a hidden native input under `name`
 * so it still participates in native <form action={...}> submissions.
 */
export function DatePicker({
  name,
  id,
  defaultValue,
  required,
  disabled,
  placeholder = 'Selecciona una fecha',
  className,
  onChange,
}: {
  name?: string;
  id?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (isoDate: string) => void;
}) {
  const [selected, setSelected] = useState<Date | undefined>(defaultValue ? parseISO(defaultValue) : undefined);
  const [month, setMonth] = useState<Date>(selected ?? new Date());
  const [open, setOpen] = useState(false);

  const isoValue = selected ? format(selected, 'yyyy-MM-dd') : '';
  const gridStart = startOfWeek(startOfMonth(month));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  function pick(day: Date) {
    setSelected(day);
    setOpen(false);
    onChange?.(format(day, 'yyyy-MM-dd'));
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={isoValue} required={required} />}
      <PopoverPrimitive.Trigger asChild>
        <button type="button" id={id} disabled={disabled} className={cn(triggerClass, className)}>
          <span className={cn(!selected && 'text-[var(--ds-neutral-400)]')}>
            {selected ? format(selected, 'd MMM yyyy', { locale: es }) : placeholder}
          </span>
          <Icon icon={CalendarIcon} size="sm" className="text-[var(--ds-neutral-400)]" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={4}
          className="ds-popover-in z-[160] w-[280px] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-100)] bg-[var(--ds-color-surface)] p-[16px] shadow-[var(--ds-shadow-md)]"
        >
          <div className="mb-[12px] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth((m) => subMonths(m, 1))}
              aria-label="Mes anterior"
              className="flex h-[28px] w-[28px] items-center justify-center rounded-[var(--ds-radius-sm)] text-[var(--ds-neutral-500)] hover:bg-[var(--ds-neutral-50)]"
            >
              <Icon icon={ChevronLeft} size="sm" />
            </button>
            <span className="font-display text-[13px] font-medium capitalize text-[var(--ds-neutral-900)]">
              {format(month, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Mes siguiente"
              className="flex h-[28px] w-[28px] items-center justify-center rounded-[var(--ds-radius-sm)] text-[var(--ds-neutral-500)] hover:bg-[var(--ds-neutral-50)]"
            >
              <Icon icon={ChevronRight} size="sm" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-[2px] text-center text-[12px] text-[var(--ds-neutral-400)]">
            {WEEKDAY_LABELS.map((d, i) => (
              <span key={i} className="py-[4px]">
                {d}
              </span>
            ))}
            {days.map((day) => {
              const isSelected = selected && isSameDay(day, selected);
              const inMonth = isSameMonth(day, month);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  className={cn(
                    'flex h-[32px] items-center justify-center rounded-[var(--ds-radius-sm)] text-[13px]',
                    'transition-colors duration-[var(--ds-duration-instant)] ease-[var(--ds-ease-standard)]',
                    !inMonth && 'text-[var(--ds-neutral-300)]',
                    inMonth && !isSelected && 'text-[var(--ds-neutral-800)] hover:bg-[var(--ds-neutral-50)]',
                    isSelected && 'bg-[var(--ds-color-primary)] font-medium text-white',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/**
 * Lighter month picker for filters (replaces native <input type="month">).
 * Works uncontrolled (defaultValue + internal state, like DatePicker) or
 * controlled (value + onChange) — pick whichever fits the surrounding
 * form. Renders a hidden input under `name` for native form submission.
 */
export function MonthPicker({
  value,
  defaultValue,
  onChange,
  name,
  id,
  className,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (monthISO: string) => void;
  name?: string;
  id?: string;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? format(new Date(), 'yyyy-MM'));
  const currentValue = isControlled ? value : internalValue;
  const current = parseISO(`${currentValue}-01`);

  function set(next: string) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <div className={cn('flex items-center gap-[4px]', className)}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        type="button"
        id={id}
        onClick={() => set(format(subMonths(current, 1), 'yyyy-MM'))}
        aria-label="Mes anterior"
        className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] text-[var(--ds-neutral-600)] hover:bg-[var(--ds-neutral-50)]"
      >
        <Icon icon={ChevronLeft} size="sm" />
      </button>
      <span className="font-display min-w-[120px] text-center text-[13px] font-medium capitalize text-[var(--ds-neutral-900)]">
        {format(current, 'MMMM yyyy', { locale: es })}
      </span>
      <button
        type="button"
        onClick={() => set(format(addMonths(current, 1), 'yyyy-MM'))}
        aria-label="Mes siguiente"
        className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] text-[var(--ds-neutral-600)] hover:bg-[var(--ds-neutral-50)]"
      >
        <Icon icon={ChevronRight} size="sm" />
      </button>
    </div>
  );
}
