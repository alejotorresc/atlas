import { Section, SubSection } from './SectionShell';
import { radiusUsage } from '@/lib/design-tokens/radius';

export function LayoutSection() {
  return (
    <Section id="layout" title="Border radius, grid & layout" description="Corners are subtle enough to soften an edge and never enough to become a visual element — the user should barely notice the radius. Avoid 'bubble UI'.">
      <SubSection title="Border radius">
        <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-3">
          {radiusUsage.map((r) => {
            const px = r.token.match(/\((\d+)px\)/)?.[1] ?? '9999';
            return (
              <div key={r.token} className="flex flex-col items-center gap-[8px] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px] text-center">
                <div className="h-[56px] w-[56px] bg-[var(--ds-color-primary-subtle)]" style={{ borderRadius: `${px}px` }} />
                <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">{r.token}</p>
                <p className="text-[12px] text-[var(--ds-neutral-500)]">{r.use}</p>
              </div>
            );
          })}
        </div>
      </SubSection>

      <SubSection title="Grid & containers">
        <div className="grid gap-[16px] sm:grid-cols-3">
          <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px]">
            <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">Mobile — 390px+</p>
            <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-600)]">Single column. 16px page margins. Cards stack full-width.</p>
          </div>
          <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px]">
            <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">Tablet — 768px+</p>
            <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-600)]">2-column card grids. 24px page margins.</p>
          </div>
          <div className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px]">
            <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">Desktop — 1024px+</p>
            <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-600)]">3–4 column card grids. Max content width 1200px, centered. 32–64px margins.</p>
          </div>
        </div>
        <p className="mt-[16px] text-[13px] text-[var(--ds-neutral-600)]">
          Card-to-card gap: 16px (mobile) / 24px (tablet+). Section-to-section gap: 32px (mobile) / 48px (desktop).
        </p>
      </SubSection>
    </Section>
  );
}
