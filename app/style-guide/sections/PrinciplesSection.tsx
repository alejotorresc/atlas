import { Section, SubSection, RuleList, Rule } from './SectionShell';

const CONFUSIONS = [
  { a: 'Minimal', b: 'Empty' },
  { a: 'Beautiful', b: 'Usable' },
  { a: 'Clean', b: 'Hidden' },
  { a: 'Industrial', b: 'Cold' },
  { a: 'Vibrant', b: 'Colorful' },
];

const VISUAL_FEEL = [
  'Modern',
  'Editorial',
  'Industrial',
  'Intentional',
  'Quiet',
  'Premium',
  'Highly legible',
  'Efficient',
  'Timeless',
];
const NOT_LIST = ['Corporate', 'Banking software', 'Enterprise dashboard', 'Crypto', 'Gaming', 'Fintech startup', 'Material Design clone'];
const REFERENCE_LIST = ['Wealth', 'Apple', 'Copilot Money', 'Monarch Money'];

export function PrinciplesSection() {
  return (
    <Section
      id="principles"
      title="Principles"
      description="The objective of ATLAS is not visual minimalism. The objective is cognitive simplicity. The interface should reduce mental effort, not information."
    >
      <SubSection title="Do not confuse">
        <div className="grid gap-[12px] sm:grid-cols-3">
          {CONFUSIONS.map((c) => (
            <div key={c.a} className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px] text-center">
              <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{c.a}</p>
              <p className="my-[4px] text-[12px] text-[var(--ds-neutral-400)]">is not</p>
              <p className="text-[15px] text-[var(--ds-neutral-500)]">{c.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-[16px] text-[13px] text-[var(--ds-neutral-600)]">
          The application always prioritizes clarity, speed, confidence, readability, and decision making over an
          empty-looking screen.
        </p>
      </SubSection>

      <SubSection title="The one-second rule">
        <p className="text-[15px] text-[var(--ds-neutral-800)]">
          Within one second, the user should understand: <strong className="font-medium">where they are</strong>,{' '}
          <strong className="font-medium">what is important</strong>, and{' '}
          <strong className="font-medium">what they should do next</strong>. If that is not true, the interface is
          too complex — not too plain.
        </p>
      </SubSection>

      <SubSection title="Visual hierarchy comes from structure, not decoration">
        <div className="grid gap-[16px] sm:grid-cols-2">
          <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-primary-subtle)] p-[16px]">
            <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-primary)]">BUILD HIERARCHY WITH</p>
            <RuleList>
              <Rule>Spacing — distance implies relationship</Rule>
              <Rule>Typography — size and weight imply importance</Rule>
              <Rule>Alignment — order implies structure</Rule>
              <Rule>Size — scale implies priority</Rule>
            </RuleList>
          </div>
          <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-neutral-100)] p-[16px]">
            <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-neutral-600)]">NEVER RELY PRIMARILY ON</p>
            <RuleList>
              <Rule>Color</Rule>
              <Rule>Borders</Rule>
              <Rule>Shadows</Rule>
              <Rule>Icons</Rule>
            </RuleList>
          </div>
        </div>
        <p className="mt-[16px] text-[15px] font-medium text-[var(--ds-neutral-900)]">
          Color is emphasis. Typography is hierarchy. Whitespace is organization.
        </p>
      </SubSection>

      <SubSection title="Whitespace is a component">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Whitespace is not empty space — it is how the interface tells the user what belongs together. Never
          compress a layout to fit more information; let content breathe. Large margins are preferred over dense
          layouts.
        </p>
      </SubSection>

      <SubSection title="Consistency">
        <RuleList>
          <Rule>Buttons always look and behave the same, everywhere they appear.</Rule>
          <Rule>Cards always use the same internal spacing (see Spacing).</Rule>
          <Rule>Inputs always follow the same rules (see Forms).</Rule>
          <Rule>Never invent a new component when an existing one in this system can solve the problem.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Reduce cognitive load">
        <RuleList>
          <Rule>Prefer intelligent defaults over asking a question the app can infer.</Rule>
          <Rule>Reduce typing, reduce clicks, reduce scrolling, reduce confirmation dialogs.</Rule>
          <Rule>Never interrupt the user&apos;s flow unless the action is destructive or truly ambiguous.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Progressive disclosure">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Do not show everything immediately — show only what is necessary for the decision at hand. Advanced detail
          appears only when the user explores further (e.g. a dashboard metric card, then its detail page, then a
          full transaction list).
        </p>
      </SubSection>

      <SubSection title="One primary action per screen">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Every screen has exactly one obvious primary action. Primary buttons never compete with each other on the
          same screen — the eye should always know where to go next.
        </p>
      </SubSection>

      <SubSection title="Visual rhythm">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Components align perfectly. Spacing between sections, cards, headings, lists, and forms stays consistent
          (see Spacing) — no irregular layouts, no visual jumps as the user scrolls.
        </p>
      </SubSection>

      <SubSection title="Data density — organize, don't reduce">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Financial apps naturally hold a lot of data. The answer is never to hide information — it is to group
          related concepts, collapse secondary detail, and keep the numbers that matter immediately visible.
        </p>
      </SubSection>

      <SubSection title="Numbers are the product">
        <RuleList>
          <Rule>Treat financial values as first-class visual elements — give them room (see the numericDisplay tier in Typography).</Rule>
          <Rule>Never let a label compete visually with its value.</Rule>
          <Rule>Currency (Q, GTQ) is always lower emphasis than the amount it labels.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Scannability">
        <p className="text-[13px] text-[var(--ds-neutral-600)]">
          Users do not read interfaces — they scan them. Every screen should let a user identify the important
          information without reading a paragraph.
        </p>
      </SubSection>

      <SubSection title="Final principle">
        <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-neutral-900)] p-[24px] text-center">
          <p className="text-[20px] font-medium text-white">Does this reduce cognitive effort?</p>
          <p className="mt-[8px] text-[13px] text-[var(--ds-neutral-300)]">If the answer is no, do not implement it.</p>
          <p className="mt-[16px] text-[15px] text-[var(--ds-neutral-300)]">
            ATLAS should never impress through visual effects. ATLAS should impress through clarity.
          </p>
        </div>
      </SubSection>

      <div className="grid gap-[24px] pt-[8px] sm:grid-cols-2">
        <div>
          <p className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">VISUAL FEEL</p>
          <ul className="mt-[12px] flex flex-wrap gap-[8px]">
            {VISUAL_FEEL.map((f) => (
              <li key={f} className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-color-primary-subtle)] px-[12px] py-[4px] text-[13px] text-[var(--ds-color-primary)]">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-[16px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">VISUAL REFERENCES</p>
          <p className="mt-[8px] text-[13px] text-[var(--ds-neutral-600)]">Inspiration for visual language only — layouts are never copied.</p>
          <ul className="mt-[12px] flex flex-wrap gap-[8px]">
            {REFERENCE_LIST.map((r) => (
              <li key={r} className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)] px-[12px] py-[4px] text-[13px] text-[var(--ds-neutral-700)]">
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">ATLAS SHOULD NEVER FEEL LIKE</p>
          <ul className="mt-[12px] flex flex-wrap gap-[8px]">
            {NOT_LIST.map((n) => (
              <li key={n} className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)] px-[12px] py-[4px] text-[13px] text-[var(--ds-neutral-600)] line-through decoration-[var(--ds-color-danger)]">
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
