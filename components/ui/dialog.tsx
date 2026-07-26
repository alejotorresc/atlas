'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Icon } from '@/components/design-system/Icon';

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="w-full max-w-lg rounded-[var(--ds-radius-xl)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-0 shadow-[var(--ds-shadow-lg)] backdrop:bg-[var(--ds-neutral-900)]/40"
      aria-labelledby="dialog-title"
    >
      <div className="p-[24px]">
        <div className="mb-[16px] flex items-center justify-between">
          <h2 id="dialog-title" className="text-[20px] font-medium text-[var(--ds-neutral-900)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-[var(--ds-neutral-400)] transition-colors duration-[var(--ds-duration-fast)] hover:text-[var(--ds-neutral-700)]"
          >
            <Icon icon={X} size="sm" />
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
