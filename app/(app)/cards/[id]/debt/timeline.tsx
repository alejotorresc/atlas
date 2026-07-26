import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  label: string;
  date: string;
}

/** Today -> Next statement -> Payment due -> Projected payoff, as a simple stepper. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <Card>
      <h2 className="font-display mb-[16px] text-[15px] font-medium text-[var(--ds-neutral-900)]">Linea de tiempo</h2>
      <div className="flex flex-col gap-[16px] sm:flex-row sm:items-start">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-1 items-center gap-[12px] sm:flex-col sm:items-stretch sm:gap-[8px]">
            <div className="flex w-full items-center sm:justify-center">
              <span className={cn('h-[10px] w-[10px] shrink-0 rounded-full', i === 0 ? 'bg-[var(--ds-color-primary)]' : 'bg-[var(--ds-neutral-300)]')} />
              {i < steps.length - 1 && <span className="ml-[8px] hidden h-px flex-1 bg-[var(--ds-neutral-200)] sm:ml-0 sm:mt-[5px] sm:block sm:h-px" />}
            </div>
            <div className="sm:text-center">
              <p className="text-[13px] font-medium text-[var(--ds-neutral-900)]">{step.label}</p>
              <p className="text-[13px] text-[var(--ds-neutral-500)]">{step.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
