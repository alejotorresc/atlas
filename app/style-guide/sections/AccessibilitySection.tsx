import { Section, SubSection, RuleList, Rule, Example } from './SectionShell';
import { Button } from '@/components/design-system/Button';

export function AccessibilitySection() {
  return (
    <Section id="accessibility" title="Accessibility" description="WCAG AA is the floor, not the target. Financial software fails its users the moment it fails to be usable.">
      <SubSection title="Contrast">
        <RuleList>
          <Rule>Body text (neutral.900 on background/surface) is 4.5:1+ against both --ds-color-background and --ds-color-surface.</Rule>
          <Rule>Secondary text uses neutral.600/700, never neutral.400/500 — those steps are reserved for borders and placeholders, which have a lower contrast bar.</Rule>
          <Rule>Semantic colors (success/warning/danger/info) always pair with text or an icon, never color alone, to carry meaning.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Keyboard & focus">
        <RuleList>
          <Rule>Every interactive element is reachable via Tab in visual order — no positive tabindex values.</Rule>
          <Rule>Focus is always visible: a 3px primary-tinted ring (shadow-[var(--ds-shadow-focus)]), never outline: none without a replacement.</Rule>
          <Rule>Dialogs and bottom sheets trap focus while open and return it to the trigger element on close.</Rule>
        </RuleList>
        <Example className="mt-[16px]">
          <p className="mb-[12px] text-[13px] text-[var(--ds-neutral-600)]">Tab to this button to see the focus ring:</p>
          <Button variant="secondary">Enfocame con Tab</Button>
        </Example>
      </SubSection>

      <SubSection title="Touch targets">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Every tappable control is at least 44×44px — the Button component&apos;s md/lg sizes and the icon-button size
          are built to this minimum by default.
        </p>
      </SubSection>

      <SubSection title="Screen readers">
        <RuleList>
          <Rule>Icon-only buttons always carry an aria-label describing the action, not the icon (&quot;Registrar movimiento&quot;, not &quot;plus icon&quot;).</Rule>
          <Rule>Decorative icons paired with visible text get aria-hidden so screen readers don&apos;t announce them twice.</Rule>
          <Rule>Form errors use role=&quot;alert&quot; (see HelperText) so they are announced immediately when they appear.</Rule>
          <Rule>Loading states set aria-busy rather than only showing a spinner.</Rule>
        </RuleList>
      </SubSection>
    </Section>
  );
}
