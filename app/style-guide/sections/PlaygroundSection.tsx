import { Section } from './SectionShell';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { MetricCard, TransactionCard, RecommendationCard } from '@/components/design-system/Cards';
import { Card } from '@/components/design-system/Card';
import { CalmLineChart } from '@/components/design-system/Chart';

const trend = [
  { label: 'Sem 1', value: 4200 },
  { label: 'Sem 2', value: 4600 },
  { label: 'Sem 3', value: 4100 },
  { label: 'Sem 4', value: 4900 },
];

export function PlaygroundSection() {
  return (
    <Section
      id="playground"
      title="Component Playground"
      description="A composed example — not a new pattern, just the components above assembled the way a real screen would use them, to prove they hold together."
    >
      <div className="rounded-[var(--ds-radius-xl)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-background)] p-[24px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Inicio</p>
            <Badge tone="success">Todo bajo control</Badge>
          </div>
          <Button>Registrar movimiento</Button>
        </div>

        <div className="mt-[24px] grid gap-[16px] sm:grid-cols-3">
          <MetricCard label="Puedes gastar" amountMinor={423000} helperText="Estimado basado en tus datos" />
          <MetricCard label="Saldo total en cuentas" amountMinor={1250000} />
          <MetricCard label="Deuda en tarjetas" amountMinor={280000} />
        </div>

        <div className="mt-[16px] grid gap-[16px] lg:grid-cols-2">
          <Card>
            <p className="mb-[12px] text-[13px] font-medium text-[var(--ds-neutral-500)]">Tendencia de gasto semanal</p>
            <CalmLineChart data={trend} />
          </Card>
          <div className="space-y-[8px]">
            <TransactionCard type="expense" description="Supermercado La Torre" date="24 jul" amountMinor={45000} />
            <TransactionCard type="income" description="Salario" date="20 jul" amountMinor={500000} />
            <TransactionCard type="transfer" description="A Ahorro emergencia" date="18 jul" amountMinor={100000} />
          </div>
        </div>

        <div className="mt-[16px]">
          <RecommendationCard
            title="Estas cerca del limite en Alimentacion"
            description="Llevas el 82% de tu presupuesto de este mes con 9 dias restantes."
            actionLabel="Ver presupuesto"
          />
        </div>
      </div>
    </Section>
  );
}
