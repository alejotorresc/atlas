import { Section } from './SectionShell';

export function IntroductionSection() {
  return (
    <Section
      id="introduction"
      title="ATLAS Design System"
      description="This page is the single source of truth for every UI decision in ATLAS. It is not a marketing brand guide — it is a living, code-backed reference: every example on this page renders the actual production component."
    >
      <div className="space-y-[16px] text-[15px] leading-[22px] text-[var(--ds-neutral-700)]">
        <p>
          ATLAS is a personal finance application. The people using it are trusting it with a private, often
          stressful part of their life. The design system exists to make sure that trust is earned in every pixel:
          calm typography, restrained color, honest data visualization, and language that explains rather than
          alarms.
        </p>
        <p>
          <strong className="font-medium text-[var(--ds-neutral-900)]">How to use this page:</strong> before building
          a new screen or component, check here first. If a pattern exists, import it from{' '}
          <code className="rounded-[4px] bg-[var(--ds-neutral-100)] px-[6px] py-[2px] text-[13px]">
            components/design-system
          </code>{' '}
          and the tokens from{' '}
          <code className="rounded-[4px] bg-[var(--ds-neutral-100)] px-[6px] py-[2px] text-[13px]">lib/design-tokens</code>.
          If it doesn&apos;t exist yet, that&apos;s a signal to add it here before recreating it ad hoc inside a
          screen.
        </p>
      </div>
    </Section>
  );
}
