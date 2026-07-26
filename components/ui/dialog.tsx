'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

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
      className="w-full max-w-lg rounded-lg border border-slate-200 p-0 backdrop:bg-slate-900/40"
      aria-labelledby="dialog-title"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="dialog-title" className="text-base font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
