import { Section, SubSection, RuleList, Rule } from './SectionShell';
import {
  MetricCard,
  SummaryCard,
  RecommendationCard,
  AccountCard,
  TransactionCard,
  BudgetCard,
  SavingsCard,
  AlertCard,
  CalendarEventCard,
} from '@/components/design-system/Cards';

export function CardsSection() {
  return (
    <Section id="cards" title="Cards" description="Reusable card patterns — every screen should compose from these rather than inventing new card layouts.">
      <SubSection title="Card design rules">
        <RuleList>
          <Rule>A card is a meaningful information group, not a floating widget — it should answer exactly one question.</Rule>
          <Rule>Avoid cards inside cards.</Rule>
          <Rule>Avoid dividers inside a card unless they separate genuinely distinct groups (e.g. SummaryCard&apos;s breakdown rows).</Rule>
          <Rule>Avoid visual noise — a card with nothing to say should not exist on the screen.</Rule>
          <Rule>Prefer lists and cards over tables. Reach for a table (see Movimientos) only when row-by-row comparison across many columns is the primary task.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Metric & summary">
        <div className="grid gap-[16px] sm:grid-cols-2">
          <MetricCard label="Puedes gastar" amountMinor={423000} helperText="Estimado basado en tus datos" />
          <SummaryCard
            title="Flujo del mes"
            amountMinor={185000}
            rows={[
              { label: 'Ingresos', amountMinor: 500000 },
              { label: 'Gastos', amountMinor: 315000 },
            ]}
          />
        </div>
      </SubSection>

      <SubSection title="Recommendation">
        <RecommendationCard
          title="Estas cerca del limite en Alimentacion"
          description="Llevas el 82% de tu presupuesto de este mes con 9 dias restantes."
          actionLabel="Ver presupuesto"
        />
      </SubSection>

      <SubSection title="Account, transaction, budget, savings">
        <div className="grid gap-[16px] sm:grid-cols-2">
          <AccountCard name="Cuenta monetaria" institution="Banco Industrial" balanceMinor={1250000} />
          <TransactionCard type="expense" description="Supermercado La Torre" date="24 jul" amountMinor={45000} />
          <BudgetCard category="Alimentacion" spentMinor={410000} budgetMinor={500000} />
          <SavingsCard name="Fondo de emergencia" currentMinor={300000} targetMinor={3000000} paceLabel="Vas en buen ritmo" />
        </div>
      </SubSection>

      <SubSection title="Alert & calendar">
        <div className="grid gap-[16px] sm:grid-cols-2">
          <AlertCard tone="warning" title="Presupuesto casi al limite" message="Alimentacion lleva 82% del presupuesto de julio." />
          <AlertCard tone="danger" title="Obligacion vencida" message="Renta no se ha pagado y vencio el 5 de julio." />
          <CalendarEventCard date="5 jul" title="Pago de tarjeta Visa" amountMinor={250000} />
        </div>
      </SubSection>
    </Section>
  );
}
