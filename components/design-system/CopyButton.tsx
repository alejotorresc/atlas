'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

/** Copies `value` to the clipboard and briefly confirms with a checkmark instead of a toast — no global toast manager wired into the app yet. */
export function CopyButton({ value, label = 'Copiar', className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing to recover from client-side.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex h-[32px] items-center gap-[6px] rounded-[var(--ds-radius-md)] px-[10px] text-[13px] font-medium text-[var(--ds-neutral-600)] transition-colors hover:bg-[var(--ds-neutral-50)] hover:text-[var(--ds-neutral-900)]',
        className,
      )}
    >
      <Icon icon={copied ? Check : Copy} size="xs" className={copied ? 'text-[var(--ds-color-success)]' : undefined} />
      {copied ? 'Copiado' : label}
    </button>
  );
}
