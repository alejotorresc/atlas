import { Section, SubSection, RuleList, Rule } from './SectionShell';
import { colors, colorUsageRules } from '@/lib/design-tokens/colors';

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)]">
      <div className="h-[64px]" style={{ backgroundColor: hex }} />
      <div className="bg-[var(--ds-color-surface)] px-[12px] py-[8px]">
        <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">{name}</p>
        <p className="text-[12px] text-[var(--ds-neutral-500)]">{hex}</p>
      </div>
    </div>
  );
}

export function ColorsSection() {
  return (
    <Section
      id="colors"
      title="Color"
      description="Desaturated and warm throughout. No pure black, no pure white, no saturated 'app' colors. Every color below carries a specific meaning — see usage rules underneath."
    >
      <SubSection title="Brand">
        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3">
          <Swatch name="Primary — Deep Teal" hex={colors.primary.DEFAULT} />
          <Swatch name="Secondary — Soft Aqua" hex={colors.secondary.DEFAULT} />
          <Swatch name="Accent — Lime" hex={colors.accent.DEFAULT} />
          <Swatch name="Background — Warm White" hex={colors.background} />
          <Swatch name="Surface" hex={colors.surface} />
        </div>
      </SubSection>

      <SubSection title="Semantic">
        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
          <Swatch name="Success" hex={colors.success.DEFAULT} />
          <Swatch name="Warning" hex={colors.warning.DEFAULT} />
          <Swatch name="Danger" hex={colors.danger.DEFAULT} />
          <Swatch name="Information" hex={colors.info.DEFAULT} />
        </div>
      </SubSection>

      <SubSection title="Neutral scale">
        <div className="grid grid-cols-5 gap-[8px] sm:grid-cols-10">
          {Object.entries(colors.neutral).map(([step, hex]) => (
            <div key={step} className="overflow-hidden rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-200)]">
              <div className="h-[48px]" style={{ backgroundColor: hex }} />
              <p className="bg-[var(--ds-color-surface)] px-[6px] py-[4px] text-center text-[11px] text-[var(--ds-neutral-600)]">{step}</p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Usage rules">
        <div className="space-y-[16px]">
          {colorUsageRules.map((rule) => (
            <div key={rule.token}>
              <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{rule.token}</p>
              <div className="mt-[8px] grid gap-[16px] sm:grid-cols-2">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-success)]">USAR PARA</p>
                  <RuleList>
                    {rule.allowed.map((a) => (
                      <Rule key={a}>{a}</Rule>
                    ))}
                  </RuleList>
                </div>
                <div>
                  <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-danger)]">NUNCA PARA</p>
                  <RuleList>
                    {rule.disallowed.map((d) => (
                      <Rule key={d}>{d}</Rule>
                    ))}
                  </RuleList>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  );
}
