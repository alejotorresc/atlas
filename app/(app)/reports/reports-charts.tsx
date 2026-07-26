'use client';

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/finance/money';
import type { CategoryExpense, MonthSummary } from '@/features/reports/queries';

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#1e293b', '#475569'];

export function IncomeExpenseChart({ data }: { data: MonthSummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => (v / 100).toLocaleString()} />
        <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
        <Legend />
        <Bar dataKey="income" name="Ingresos" fill="#0f172a" />
        <Bar dataKey="expenses" name="Gastos" fill="#94a3b8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpenseDistributionChart({ data }: { data: CategoryExpense[] }) {
  if (data.length === 0) return <p className="text-sm text-[var(--ds-neutral-500)]">Sin gastos categorizados este mes.</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="amountMinor" nameKey="categoryName" outerRadius={100} label={(entry) => String(entry.name ?? '')}>
          {data.map((entry, i) => (
            <Cell key={entry.categoryId} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ExpenseComparisonChart({ data }: { data: MonthSummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => (v / 100).toLocaleString()} />
        <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
        <Bar dataKey="expenses" name="Gastos" fill="#334155" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsContributionsChart({ data }: { data: MonthSummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => (v / 100).toLocaleString()} />
        <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
        <Bar dataKey="savingsContributions" name="Ahorro" fill="#0f172a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
