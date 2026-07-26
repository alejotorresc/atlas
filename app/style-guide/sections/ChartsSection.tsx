import { Section, SubSection, RuleList, Rule, Example } from './SectionShell';
import { CalmBarChart, CalmLineChart } from '@/components/design-system/Chart';

const monthly = [
  { label: 'Mar', income: 5200, expenses: 3400 },
  { label: 'Abr', income: 5200, expenses: 3900 },
  { label: 'May', income: 5400, expenses: 3100 },
  { label: 'Jun', income: 5200, expenses: 4200 },
  { label: 'Jul', income: 5600, expenses: 3600 },
];

const trend = [
  { label: 'Sem 1', value: 4200 },
  { label: 'Sem 2', value: 4600 },
  { label: 'Sem 3', value: 4100 },
  { label: 'Sem 4', value: 4900 },
];

export function ChartsSection() {
  return (
    <Section id="charts" title="Data visualization" description="Financial data must be calm: minimal grid, thin strokes, a maximum of two colors, no gradients, no 3D, no decorative charts.">
      <SubSection title="Rules">
        <RuleList>
          <Rule>Horizontal gridlines only — no vertical gridlines, no axis borders.</Rule>
          <Rule>2px stroke width for lines, no data-point dots unless a single value must be called out.</Rule>
          <Rule>Maximum two series colors per chart (primary + secondary), plus semantic colors only when the chart is explicitly about status.</Rule>
          <Rule>No gradients, no drop shadows on chart elements, no 3D bar/pie effects.</Rule>
          <Rule>Every chart ships with an accessible data table nearby — a chart is never the only way to read a number.</Rule>
        </RuleList>
      </SubSection>

      <SubSection title="Line — trend over time">
        <Example>
          <CalmLineChart data={trend} />
        </Example>
      </SubSection>

      <SubSection title="Bar — comparison">
        <Example>
          <CalmBarChart data={monthly} />
        </Example>
      </SubSection>
    </Section>
  );
}
