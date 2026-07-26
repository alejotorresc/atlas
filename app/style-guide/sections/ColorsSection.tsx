import { Section, SubSection, RuleList, Rule } from './SectionShell';
import { colors, colorUsageRules, grey } from '@/lib/design-tokens/colors';

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)]">
      <div className="h-[64px] border-b border-[var(--ds-neutral-200)]" style={{ backgroundColor: hex }} />
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
      description="Almost monochromatic: ~85% neutral, ~10% Brand Blue, ~5% semantic. There is exactly one brand color in the entire product. If a screen feels colorful, too much color is being used."
    >
      <SubSection title="Brand Blue — the only brand color">
        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-3">
          <Swatch name="Brand Blue" hex={colors.primary.DEFAULT} />
          <Swatch name="Background & Surface — White" hex={colors.background} />
          <Swatch name="Secondary surface" hex={colors.surfaceSecondary} />
        </div>
        <p className="mt-[12px] text-[13px] text-[var(--ds-neutral-600)]">
          Precision, technology, focus, interaction, clarity. Use only for primary buttons, active navigation,
          selected elements, links, focus rings, progress indicators, and primary chart series. Never as a
          decorative background, never to mean &quot;success,&quot; and it should attract attention specifically
          because it is rare.
        </p>
      </SubSection>

      <SubSection title="Semantic">
        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-5">
          <Swatch name="Success" hex={colors.success.DEFAULT} />
          <Swatch name="Warning" hex={colors.warning.DEFAULT} />
          <Swatch name="Caution" hex={colors.caution.DEFAULT} />
          <Swatch name="Critical" hex={colors.danger.DEFAULT} />
          <Swatch name="Information" hex={colors.info.DEFAULT} />
        </div>
        <p className="mt-[12px] text-[13px] text-[var(--ds-neutral-600)]">
          Warning and Caution are deliberately distinct: Warning (yellow) is for upcoming due dates and approaching
          limits — informational, not urgent. Caution (orange) is reserved for when immediate attention is genuinely
          required — a budget nearly exhausted, a payment due tomorrow. Critical (red) is for what has already gone
          wrong. Text rendered in these hues uses a darkened variant for legibility — the vivid values above are for
          fills, badges backgrounds, and large elements, not small text.
        </p>
      </SubSection>

      <SubSection title="Neutral scale — Grey 1 to Grey 6">
        <div className="grid grid-cols-4 gap-[8px] sm:grid-cols-8">
          <Swatch name="White" hex={grey.white} />
          <Swatch name="Grey 1" hex={grey.grey1} />
          <Swatch name="Grey 2" hex={grey.grey2} />
          <Swatch name="Grey 3" hex={grey.grey3} />
          <Swatch name="Grey 4" hex={grey.grey4} />
          <Swatch name="Grey 5" hex={grey.grey5} />
          <Swatch name="Grey 6" hex={grey.grey6} />
          <Swatch name="Black" hex={grey.black} />
        </div>
        <p className="mt-[12px] text-[13px] text-[var(--ds-neutral-600)]">
          Most screens are built almost entirely from this scale. Black is used very sparingly — never as body text
          on a large paragraph (use Grey 6 instead).
        </p>
      </SubSection>

      <SubSection title="Usage rules">
        <div className="space-y-[16px]">
          {colorUsageRules.map((rule) => (
            <div key={rule.token}>
              <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{rule.token}</p>
              <div className="mt-[8px] grid gap-[16px] sm:grid-cols-2">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-success-text)]">USAR PARA</p>
                  <RuleList>
                    {rule.allowed.map((a) => (
                      <Rule key={a}>{a}</Rule>
                    ))}
                  </RuleList>
                </div>
                <div>
                  <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-danger-text)]">NUNCA PARA</p>
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

      <SubSection title="Never do this">
        <RuleList>
          <Rule>Multiple accent colors on the same screen.</Rule>
          <Rule>A different color for every KPI, to &quot;differentiate&quot; them.</Rule>
          <Rule>Rainbow dashboards.</Rule>
          <Rule>Coloring a card unnecessarily.</Rule>
          <Rule>Coloring an icon unless the icon is communicating state.</Rule>
          <Rule>Gradients or colorful backgrounds.</Rule>
          <Rule>Relying on color to create hierarchy — that is typography, spacing, composition, alignment, and size (color comes last).</Rule>
        </RuleList>
      </SubSection>
    </Section>
  );
}
