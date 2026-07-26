import { Section, SubSection, RuleList, Rule, Example } from './SectionShell';
import { BottomSheet } from '@/components/design-system/BottomSheet';
import { Button } from '@/components/design-system/Button';

export function MobileSection() {
  return (
    <Section id="mobile" title="Mobile first" description="ATLAS is designed primarily for iPhone. Every component is built and checked at 390px before it is checked at desktop widths.">
      <SubSection title="Bottom navigation & thumb reach">
        <RuleList>
          <Rule>Primary navigation lives in a fixed bottom bar on mobile, not a hamburger menu — the 5 most-used destinations only.</Rule>
          <Rule>The most frequent action (&quot;Registrar movimiento&quot;) is reachable with a thumb without shifting grip — bottom-right or bottom-center, never top-right.</Rule>
          <Rule>Destructive actions sit away from the natural thumb arc to avoid accidental taps.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Safe areas">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Bottom sheets and fixed bottom bars pad for <code className="rounded-[4px] bg-[var(--ds-neutral-100)] px-[6px] py-[2px] text-[12px]">env(safe-area-inset-bottom)</code> so
          content never sits under the home indicator (see BottomSheet below).
        </p>
      </SubSection>

      <SubSection title="Bottom sheet">
        <Example className="flex justify-center bg-[var(--ds-neutral-200)]">
          <BottomSheet title="Registrar gasto">
            <div className="space-y-[12px]">
              <p className="text-[13px] text-[var(--ds-neutral-600)]">
                Formularios de registro rapido usan bottom sheet en mobile en vez de un dialogo centrado — es mas
                facil de alcanzar con el pulgar.
              </p>
              <Button className="w-full">Continuar</Button>
            </div>
          </BottomSheet>
        </Example>
      </SubSection>

      <SubSection title="Keyboard behavior">
        <RuleList>
          <Rule>Forms scroll the focused field above the keyboard rather than letting the keyboard cover it.</Rule>
          <Rule>Numeric/currency fields use inputMode=&quot;decimal&quot; to surface the numeric keyboard without changing the input type.</Rule>
          <Rule>The primary submit action stays reachable — sticky at the bottom of the sheet — rather than requiring a scroll past the keyboard.</Rule>
        </RuleList>
      </SubSection>
    </Section>
  );
}
