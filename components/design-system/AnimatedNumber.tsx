'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/finance/money';

const TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };

/** Smoothly tweens a monetary amount between values instead of snapping — used by the payment simulators. */
export function AnimatedAmount({ amountMinor, currency = 'GTQ', className }: { amountMinor: number; currency?: string; className?: string }) {
  const [display, setDisplay] = useState(amountMinor);
  const prev = useRef(amountMinor);

  useEffect(() => {
    const controls = animate(prev.current, amountMinor, { ...TRANSITION, onUpdate: setDisplay });
    prev.current = amountMinor;
    return () => controls.stop();
  }, [amountMinor]);

  return <span className={cn('tabular-nums', className)}>{formatCurrency(Math.round(display), currency)}</span>;
}

/** Smoothly tweens a plain number (e.g. months) between values. */
export function AnimatedNumber({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, { ...TRANSITION, onUpdate: setDisplay });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={cn('tabular-nums', className)}>
      {Math.round(display)}
      {suffix}
    </span>
  );
}
