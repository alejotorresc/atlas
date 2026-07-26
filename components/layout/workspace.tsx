import type { ReactNode } from 'react';

/**
 * Two-column workspace: primary content plus a context panel that
 * surfaces module-specific supporting information (next commitment,
 * utilization, filters...) without the user having to navigate away.
 * Stacks to a single column on mobile/tablet — the context panel drops
 * below the primary content instead of competing for width.
 */
export function Workspace({ children, context }: { children: ReactNode; context?: ReactNode }) {
  if (!context) return <>{children}</>;

  return (
    <div className="flex flex-col gap-[40px] lg:flex-row lg:items-start lg:gap-[48px]">
      <div className="min-w-0 flex-1">{children}</div>
      <aside className="w-full shrink-0 space-y-[32px] lg:sticky lg:top-[40px] lg:w-[300px]">{context}</aside>
    </div>
  );
}

/** A single labeled block inside the context panel — one question, one answer. */
export function ContextSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">{title.toUpperCase()}</h2>
      {children}
    </div>
  );
}
