import { Section } from './SectionShell';
import { spacingUsage } from '@/lib/design-tokens/spacing';

export function SpacingSection() {
  return (
    <Section id="spacing" title="Spacing" description="An 8-point system (with a 4px half-step). Every gap, padding, and margin in ATLAS maps to one of these values.">
      <div className="space-y-[12px]">
        {spacingUsage.map((s) => (
          <div key={s.token} className="flex items-center gap-[16px]">
            <div className="w-[48px] shrink-0 text-[13px] font-medium text-[var(--ds-neutral-900)]">{s.token}px</div>
            <div className="h-[16px] shrink-0 rounded-[2px] bg-[var(--ds-color-primary)]" style={{ width: `${s.token}px` }} />
            <p className="text-[13px] text-[var(--ds-neutral-600)]">{s.use}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
