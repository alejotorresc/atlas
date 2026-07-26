import { Section, SubSection, Example, RuleList, Rule } from './SectionShell';
import { duration, easing, motionPresets } from '@/lib/design-tokens/motion';
import { Toast } from '@/components/design-system/Toast';

export function MotionSection() {
  return (
    <Section id="motion" title="Motion" description="Subtle, fast, purposeful. Motion confirms that something happened — it never entertains. Nothing bounces or overshoots.">
      <SubSection title="Purpose, not decoration">
        <RuleList>
          <Rule>Motion exists only to improve understanding — never animate purely for decoration.</Rule>
          <Rule>Every animation communicates one of: continuity (a sheet sliding from the edge it will return to), state change (a checkbox filling in), focus (a dialog scaling in from its trigger), or completion (a toast confirming an action).</Rule>
          <Rule>Success feedback stays subtle — never celebrate a simple action (see Success in Writing).</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Durations">
        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
          {Object.entries(duration).map(([name, ms]) => (
            <div key={name} className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px] text-center">
              <p className="text-[20px] font-medium text-[var(--ds-neutral-900)]">{ms}ms</p>
              <p className="text-[13px] text-[var(--ds-neutral-500)]">{name}</p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Easing">
        <div className="grid gap-[12px] sm:grid-cols-3">
          {Object.entries(easing).map(([name, curve]) => (
            <div key={name} className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px]">
              <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">{name}</p>
              <p className="mt-[4px] font-mono text-[12px] text-[var(--ds-neutral-500)]">{curve}</p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Presets">
        <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)]">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--ds-neutral-50)] text-left text-[var(--ds-neutral-500)]">
              <tr>
                <th className="px-[16px] py-[8px]">Preset</th>
                <th className="px-[16px] py-[8px]">Duration</th>
                <th className="px-[16px] py-[8px]">Easing</th>
                <th className="px-[16px] py-[8px]">Properties</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(motionPresets).map(([name, preset]) => (
                <tr key={name} className="border-t border-[var(--ds-neutral-200)]">
                  <td className="px-[16px] py-[8px] font-medium text-[var(--ds-neutral-900)]">{name}</td>
                  <td className="px-[16px] py-[8px]">{preset.duration}ms</td>
                  <td className="px-[16px] py-[8px] font-mono text-[12px]">{preset.easing}</td>
                  <td className="px-[16px] py-[8px] text-[var(--ds-neutral-500)]">{preset.property}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SubSection>

      <SubSection title="Toast (uses toastEnter/toastExit)">
        <Example>
          <Toast tone="success" message="Movimiento registrado" />
        </Example>
      </SubSection>
    </Section>
  );
}
