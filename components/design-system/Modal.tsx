'use client';

import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/**
 * Modal — a Radix Dialog with backdrop blur, a scale+fade open/close
 * animation (see .ds-modal-* in globals.css), a scrollable body, and an
 * optional footer pinned to the bottom instead of scrolling away with
 * long content. Distinct from the older native <dialog>-based
 * components/ui/dialog.tsx — this one is for modals where motion and a
 * pinned footer matter (e.g. the transaction registration flow).
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  widthClassName = 'w-[calc(100vw-32px)] sm:w-[640px]',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  widthClassName?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ds-modal-overlay fixed inset-0 z-[150] bg-[var(--ds-neutral-900)]/30 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            'ds-modal-content fixed left-1/2 top-1/2 z-[151] flex max-h-[85vh] flex-col overflow-hidden',
            'rounded-[var(--ds-radius-xl)] border border-[var(--ds-neutral-100)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-lg)]',
            'focus:outline-none',
            widthClassName,
          )}
        >
          <div className="flex shrink-0 items-start justify-between px-[24px] pb-[16px] pt-[24px]">
            <div>
              <DialogPrimitive.Title className="font-display text-[20px] font-medium text-[var(--ds-neutral-900)]">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Cerrar"
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[var(--ds-radius-md)] text-[var(--ds-neutral-400)] transition-colors duration-[var(--ds-duration-fast)] hover:bg-[var(--ds-neutral-50)] hover:text-[var(--ds-neutral-700)]"
              >
                <Icon icon={X} size="sm" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[24px]">{children}</div>

          {footer && <div className="shrink-0 border-t border-[var(--ds-neutral-100)] px-[24px] py-[16px]">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
