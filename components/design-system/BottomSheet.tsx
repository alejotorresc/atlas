import { ReactNode } from 'react';

/**
 * BottomSheet — the mobile-primary equivalent of a dialog. Only the top
 * corners are rounded (2xl), it docks to the bottom of the viewport, and
 * it includes a drag handle affordance even though drag-to-dismiss is a
 * progressive enhancement, not a requirement.
 *
 * This is the static/visual form for the style guide; app usage would
 * wrap this in the same open/close mechanics as Dialog.
 */
export function BottomSheet({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-t-[var(--ds-radius-2xl)] bg-[var(--ds-color-surface)] shadow-[var(--ds-shadow-lg)]">
      <div className="flex justify-center pt-[8px]">
        <span className="h-[4px] w-[36px] rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-300)]" />
      </div>
      <div className="px-[24px] pt-[16px] pb-[calc(24px+env(safe-area-inset-bottom))]">
        <p className="text-[20px] font-medium text-[var(--ds-neutral-900)]">{title}</p>
        <div className="mt-[16px]">{children}</div>
      </div>
    </div>
  );
}
