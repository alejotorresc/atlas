import { Section, SubSection, Example, RuleList, Rule } from './SectionShell';
import { typeScale, fontWeight, monoUsageRules } from '@/lib/design-tokens/typography';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';

export function TypographySection() {
  return (
    <Section
      id="typography"
      title="Typography"
      description="GT Pressura Extended is the official ATLAS typeface — ~95% of the interface. Hierarchy comes from size and spacing first — reach for weight last. GT Pressura Mono is a separate, deliberately rare (~5%) editorial accent — see below."
    >
      <SubSection title="Weights">
        <RuleList>
          <Rule>Allowed: Light, Regular, Medium, Bold.</Rule>
          <Rule>Black exists in the source family but is not loaded by default — reserve it for an exceptional, rare display moment, if one ever arises.</Rule>
          <Rule>No italic in the UI — the italic cut is intentionally not loaded.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Type scale">
        <div className="space-y-[24px]">
          {(Object.entries(typeScale) as [string, (typeof typeScale)[string]][]).map(([key, style]) => (
            <div key={key} className="border-b border-[var(--ds-neutral-200)] pb-[24px] last:border-b-0">
              <p
                style={{
                  fontSize: style.fontSize,
                  lineHeight: `${style.lineHeight}px`,
                  fontWeight: fontWeight[style.weight],
                  letterSpacing: style.letterSpacing,
                }}
                className="text-[var(--ds-neutral-900)]"
              >
                Puedes gastar Q 4,230.00
              </p>
              <p className="mt-[8px] text-[13px] text-[var(--ds-neutral-500)]">
                <span className="font-medium text-[var(--ds-neutral-700)]">{key}</span> · {style.fontSize}/{style.lineHeight} ·{' '}
                {style.weight} — {style.purpose}
              </p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Numeric hierarchy">
        <p className="mb-[16px] text-[13px] text-[var(--ds-neutral-600)]">
          Large financial numbers use Medium weight, not Bold — Bold at 34px reads aggressive; Medium reads
          confident. Tabular figures keep columns of numbers aligned.
        </p>
        <Example>
          <div className="flex flex-col gap-[16px]">
            <div>
              <p className="text-[13px] text-[var(--ds-neutral-500)]">Saldo total en cuentas</p>
              <NumericDisplay amountMinor={2458045} size="numericDisplay" />
            </div>
            <div>
              <p className="text-[13px] text-[var(--ds-neutral-500)]">Movimiento en tabla</p>
              <NumericDisplay amountMinor={125000} size="numericBody" />
            </div>
            <div className="flex gap-[24px]">
              <div>
                <p className="text-[13px] text-[var(--ds-neutral-500)]">Gasto</p>
                <NumericDisplay amountMinor={-85000} size="numericBody" tone="negative" showSign />
              </div>
              <div>
                <p className="text-[13px] text-[var(--ds-neutral-500)]">Ingreso</p>
                <NumericDisplay amountMinor={350000} size="numericBody" tone="positive" showSign />
              </div>
            </div>
          </div>
        </Example>
      </SubSection>

      <SubSection title="GT Pressura Mono — the rare accent">
        <p className="mb-[16px] text-[13px] text-[var(--ds-neutral-600)]">{monoUsageRules.principle}</p>
        <Example>
          <div className="flex flex-wrap items-center gap-[24px]">
            <span style={{ fontFamily: 'var(--ds-font-mono-accent)' }} className="text-[13px] text-[var(--ds-neutral-600)]">
              #TX-000123
            </span>
            <span style={{ fontFamily: 'var(--ds-font-mono-accent)' }} className="text-[13px] text-[var(--ds-neutral-600)]">
              Actualizado hace 2 horas
            </span>
            <span style={{ fontFamily: 'var(--ds-font-mono-accent)' }} className="text-[13px] text-[var(--ds-neutral-600)]">
              **** 4521
            </span>
            <span style={{ fontFamily: 'var(--ds-font-mono-accent)' }} className="text-[13px] text-[var(--ds-neutral-600)]">
              v1.2.0
            </span>
            <span style={{ fontFamily: 'var(--ds-font-mono-accent)' }} className="text-[13px] text-[var(--ds-neutral-600)]">
              GTQ
            </span>
          </div>
        </Example>
        <div className="mt-[16px] grid gap-[16px] sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-success-text)]">USAR PARA</p>
            <RuleList>
              {monoUsageRules.allowed.map((a) => (
                <Rule key={a}>{a}</Rule>
              ))}
            </RuleList>
          </div>
          <div>
            <p className="text-[12px] font-medium tracking-[0.02em] text-[var(--ds-color-danger-text)]">NUNCA PARA</p>
            <RuleList>
              {monoUsageRules.prohibited.map((p) => (
                <Rule key={p}>{p}</Rule>
              ))}
            </RuleList>
          </div>
        </div>
      </SubSection>
    </Section>
  );
}
