'use client';

import type { ReactNode } from 'react';
import { Modal } from '@/components/design-system/Modal';

/**
 * Re-skinned onto the same Modal primitive as the transaction form (blur
 * backdrop, scale+fade open/close animation, subtle radius/shadow) so
 * every dialog in the app shares one visual language — not just the one
 * that got a full rebuild. Keeps the original simple API (a single
 * scrollable body, no pinned footer) so none of its ~10 existing
 * consumers need to change; the submit button lives with its form as
 * before.
 */
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
  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()} title={title}>
      <div className="pb-[24px] pt-[8px]">{children}</div>
    </Modal>
  );
}
