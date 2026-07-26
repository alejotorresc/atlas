import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Section, SubSection, RuleList, Rule } from './SectionShell';
import { Icon } from '@/components/design-system/Icon';
import { iconMap, iconRules, iconSizes, iconStrokeWidth } from '@/lib/design-tokens/icons';

export function IconsSection() {
  return (
    <Section
      id="icons"
      title="Icons"
      description={`ATLAS uses exactly one icon family: Lucide (lucide-react), stroke width ${iconStrokeWidth}, outline only, never filled.`}
    >
      <SubSection title="Rules">
        <RuleList>
          {iconRules.map((r) => (
            <Rule key={r}>{r}</Rule>
          ))}
        </RuleList>
      </SubSection>

      <SubSection title="Sizes">
        <div className="flex items-end gap-[24px]">
          {Object.entries(iconSizes).map(([name, px]) => (
            <div key={name} className="flex flex-col items-center gap-[8px]">
              <Icon icon={LucideIcons.Bell} size={name as keyof typeof iconSizes} className="text-[var(--ds-neutral-800)]" />
              <p className="text-[12px] text-[var(--ds-neutral-500)]">
                {name} · {px}px
              </p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Concept mapping">
        <p className="mb-[16px] text-[13px] text-[var(--ds-neutral-600)]">
          The same concept always uses the same glyph across the product — never swap icons for the same idea between
          screens.
        </p>
        <div className="grid grid-cols-3 gap-[16px] sm:grid-cols-4 md:grid-cols-6">
          {Object.entries(iconMap).map(([concept, iconName]) => {
            const LucideIconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ?? LucideIcons.Circle;
            return (
              <div key={concept} className="flex flex-col items-center gap-[8px] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] py-[16px]">
                <Icon icon={LucideIconComponent} size="lg" className="text-[var(--ds-color-primary)]" />
                <p className="text-[12px] text-[var(--ds-neutral-600)]">{concept}</p>
              </div>
            );
          })}
        </div>
      </SubSection>
    </Section>
  );
}
