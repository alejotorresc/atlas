import { Section } from './SectionShell';

const PRINCIPLES = [
  { title: 'Calm over urgent', body: 'Nothing in ATLAS should demand attention through color, motion, or size unless the user genuinely needs to act right now.' },
  { title: 'Numbers are the interface', body: 'Financial figures carry the meaning. Typography and spacing exist to make numbers easy to compare and trust, never to compete with them.' },
  { title: 'One idea per screen', body: 'A dashboard is not a spreadsheet. Surface the single most useful figure or decision, and let detail live one tap away.' },
  { title: 'Restraint over decoration', body: 'No gradients, no 3D, no illustrative flourishes. Every visual element must earn its place by carrying information.' },
  { title: 'Honest defaults', body: 'Never round, hide, or dramatize a number to make a screen look better. Trust is the product.' },
];

const NOT_LIST = ['Corporate', 'Banking software', 'Enterprise dashboard', 'Crypto', 'Gaming', 'Fintech startup', 'Material Design clone'];
const REFERENCE_LIST = ['Wealth', 'Apple', 'Copilot Money', 'Monarch Money'];

export function PrinciplesSection() {
  return (
    <Section id="principles" title="Principles">
      <div className="grid gap-[16px] sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-[16px]">
            <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{p.title}</p>
            <p className="mt-[8px] text-[13px] leading-[18px] text-[var(--ds-neutral-600)]">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-[24px] sm:grid-cols-2">
        <div>
          <p className="text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">VISUAL REFERENCES</p>
          <p className="mt-[8px] text-[13px] text-[var(--ds-neutral-600)]">
            Used as inspiration for visual language only — layouts are not copied.
          </p>
          <ul className="mt-[12px] flex flex-wrap gap-[8px]">
            {REFERENCE_LIST.map((r) => (
              <li key={r} className="rounded-[var(--ds-radius-pill)] bg-[var(--ds-color-primary-subtle)] px-[12px] py-[4px] text-[13px] text-[var(--ds-color-primary)]">
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
