import { ReactNode } from 'react';

export function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[32px] border-b border-[var(--ds-neutral-200)] py-[48px] first:pt-0 last:border-b-0">
      <h2 className="text-[28px] font-medium leading-[34px] tracking-[-0.01em] text-[var(--ds-neutral-900)]">{title}</h2>
      {description && <p className="mt-[8px] max-w-[640px] text-[15px] text-[var(--ds-neutral-600)]">{description}</p>}
      <div className="mt-[32px] space-y-[32px]">{children}</div>
    </section>
  );
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[20px] font-medium text-[var(--ds-neutral-900)]">{title}</h3>
      <div className="mt-[16px]">{children}</div>
    </div>
  );
}

/** Wraps a live component example with a neutral demo backdrop. */
export function Example({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        'rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] bg-[var(--ds-neutral-50)] p-[24px] ' + (className ?? '')
      }
    >
      {children}
    </div>
  );
}

export function Rule({ children }: { children: ReactNode }) {
  return <li className="text-[13px] text-[var(--ds-neutral-600)] leading-[20px]">{children}</li>;
}

export function RuleList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-[4px] pl-[20px]">{children}</ul>;
}
