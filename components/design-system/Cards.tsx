import type { LucideIcon } from 'lucide-react';
import { ArrowDownLeft, ArrowUpRight, Lightbulb, Repeat } from 'lucide-react';
import { Card } from './Card';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { NumericDisplay } from './NumericDisplay';

/** Metric card — a single labeled figure. The dashboard's primary building block. */
export function MetricCard({ label, amountMinor, currency = 'GTQ', helperText }: { label: string; amountMinor: number; currency?: string; helperText?: string }) {
  return (
    <Card>
      <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">{label}</p>
      <div className="mt-[4px]">
        <NumericDisplay amountMinor={amountMinor} currency={currency} size="numericDisplay" />
      </div>
      {helperText && <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">{helperText}</p>}
    </Card>
  );
}

/** Summary card — a labeled figure plus a compact breakdown list. */
export function SummaryCard({
  title,
  amountMinor,
  currency = 'GTQ',
  rows,
}: {
  title: string;
  amountMinor: number;
  currency?: string;
  rows: { label: string; amountMinor: number }[];
}) {
  return (
    <Card>
      <p className="text-[13px] font-medium text-[var(--ds-neutral-500)]">{title}</p>
      <div className="mt-[4px] mb-[16px]">
        <NumericDisplay amountMinor={amountMinor} currency={currency} size="numericDisplay" />
      </div>
      <div className="space-y-[8px] border-t border-[var(--ds-neutral-200)] pt-[12px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--ds-neutral-600)]">{row.label}</span>
            <NumericDisplay amountMinor={row.amountMinor} currency={currency} size="small" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Recommendation card — a single, calm, actionable suggestion. Never alarming. */
export function RecommendationCard({ title, description, actionLabel }: { title: string; description: string; actionLabel?: string }) {
  return (
    <Card className="bg-[var(--ds-color-primary-subtle)] border-transparent">
      <div className="flex gap-[12px]">
        <Icon icon={Lightbulb} className="mt-[2px] shrink-0 text-[var(--ds-color-primary)]" />
        <div>
          <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{title}</p>
          <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-700)]">{description}</p>
          {actionLabel && <p className="mt-[8px] text-[13px] font-medium text-[var(--ds-color-primary)]">{actionLabel} →</p>}
        </div>
      </div>
    </Card>
  );
}

/** Account card — balance plus inclusion state. */
export function AccountCard({ name, institution, balanceMinor, currency = 'GTQ' }: { name: string; institution: string; balanceMinor: number; currency?: string }) {
  return (
    <Card state="interactive">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{name}</p>
          <p className="text-[13px] text-[var(--ds-neutral-500)]">{institution}</p>
        </div>
      </div>
      <div className="mt-[12px]">
        <NumericDisplay amountMinor={balanceMinor} currency={currency} size="numericBody" />
      </div>
    </Card>
  );
}

const TRANSACTION_ICON: Record<'income' | 'expense' | 'transfer', LucideIcon> = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  transfer: Repeat,
};

/** Transaction card / row — the canonical way to render a single movement. */
export function TransactionCard({
  type,
  description,
  date,
  amountMinor,
  currency = 'GTQ',
}: {
  type: 'income' | 'expense' | 'transfer';
  description: string;
  date: string;
  amountMinor: number;
  currency?: string;
}) {
  const tone = type === 'income' ? 'positive' : type === 'expense' ? 'negative' : 'neutral';
  return (
    <Card state="interactive" className="flex items-center justify-between gap-[12px]">
      <div className="flex items-center gap-[12px]">
        <span
          className={
            'flex h-[36px] w-[36px] items-center justify-center rounded-full ' +
            (type === 'income'
              ? 'bg-[var(--ds-color-success-subtle)] text-[var(--ds-color-success-text)]'
              : type === 'expense'
                ? 'bg-[var(--ds-color-danger-subtle)] text-[var(--ds-color-danger-text)]'
                : 'bg-[var(--ds-neutral-100)] text-[var(--ds-neutral-600)]')
          }
        >
          <Icon icon={TRANSACTION_ICON[type]} size="sm" />
        </span>
        <div>
          <p className="text-[15px] text-[var(--ds-neutral-900)]">{description}</p>
          <p className="text-[13px] text-[var(--ds-neutral-500)]">{date}</p>
        </div>
      </div>
      <NumericDisplay amountMinor={amountMinor} currency={currency} tone={tone} showSign={type !== 'transfer'} />
    </Card>
  );
}

/** Budget card — assigned vs. spent, with a calm progress fill (no red until truly exceeded). */
export function BudgetCard({
  category,
  spentMinor,
  budgetMinor,
  currency = 'GTQ',
}: {
  category: string;
  spentMinor: number;
  budgetMinor: number;
  currency?: string;
}) {
  const pct = budgetMinor > 0 ? Math.min(spentMinor / budgetMinor, 1) : 0;
  const exceeded = spentMinor > budgetMinor;
  const warning = !exceeded && pct >= 0.8;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{category}</p>
        <Badge tone={exceeded ? 'danger' : warning ? 'warning' : 'success'}>
          {exceeded ? 'Excedido' : warning ? 'Casi al limite' : 'Bajo control'}
        </Badge>
      </div>
      <div className="mt-[12px] h-[8px] w-full rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)]">
        <div
          className="h-[8px] rounded-[var(--ds-radius-pill)] transition-[width] duration-[var(--ds-duration-base)]"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: exceeded ? 'var(--ds-color-danger)' : warning ? 'var(--ds-color-warning)' : 'var(--ds-color-success)',
          }}
        />
      </div>
      <div className="mt-[8px] flex justify-between text-[13px] text-[var(--ds-neutral-500)]">
        <NumericDisplay amountMinor={spentMinor} currency={currency} size="small" />
        <span>de {formatQuick(budgetMinor, currency)}</span>
      </div>
    </Card>
  );
}

function formatQuick(amountMinor: number, currency: string) {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency }).format(amountMinor / 100);
}

/** Savings card — progress toward a goal. */
export function SavingsCard({
  name,
  currentMinor,
  targetMinor,
  currency = 'GTQ',
  paceLabel,
}: {
  name: string;
  currentMinor: number;
  targetMinor: number;
  currency?: string;
  paceLabel?: string;
}) {
  const pct = targetMinor > 0 ? Math.min(currentMinor / targetMinor, 1) : 0;
  return (
    <Card state="interactive">
      <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{name}</p>
      <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">
        {formatQuick(currentMinor, currency)} de {formatQuick(targetMinor, currency)}
      </p>
      <div className="mt-[12px] h-[8px] w-full rounded-[var(--ds-radius-pill)] bg-[var(--ds-neutral-100)]">
        <div className="h-[8px] rounded-[var(--ds-radius-pill)] bg-[var(--ds-color-primary)]" style={{ width: `${pct * 100}%` }} />
      </div>
      {paceLabel && <p className="mt-[8px] text-[13px] text-[var(--ds-color-success-text)]">{paceLabel}</p>}
    </Card>
  );
}

/** Alert card — status-colored, always paired with plain-language copy. */
export function AlertCard({ tone, title, message }: { tone: 'info' | 'warning' | 'danger'; title: string; message: string }) {
  return (
    <Card
      className={
        tone === 'danger'
          ? 'bg-[var(--ds-color-danger-subtle)] border-transparent'
          : tone === 'warning'
            ? 'bg-[var(--ds-color-warning-subtle)] border-transparent'
            : 'bg-[var(--ds-color-info-subtle)] border-transparent'
      }
    >
      <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{title}</p>
      <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-700)]">{message}</p>
    </Card>
  );
}

/** Calendar card — a single day's agenda entry. */
export function CalendarEventCard({ date, title, amountMinor, currency = 'GTQ' }: { date: string; title: string; amountMinor: number; currency?: string }) {
  return (
    <Card state="interactive" className="flex items-center justify-between">
      <div>
        <p className="text-[13px] text-[var(--ds-neutral-500)]">{date}</p>
        <p className="text-[15px] text-[var(--ds-neutral-900)]">{title}</p>
      </div>
      <NumericDisplay amountMinor={amountMinor} currency={currency} size="small" />
    </Card>
  );
}
