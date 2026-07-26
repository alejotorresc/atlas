'use client';

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Chart defaults for ATLAS financial data: a single thin gridline axis,
 * no vertical gridlines, thin 2px strokes, a two-color palette maximum,
 * no gradients, no 3D, no decorative fills. The goal is a chart that
 * reads calmly at a glance, not one that demands attention.
 */

const AXIS_STYLE = { fontSize: 12, fill: 'var(--ds-neutral-500)' };
const GRID_STROKE = 'var(--ds-neutral-200)';

export function CalmLineChart({ data, dataKey = 'value', xKey = 'label' }: { data: Record<string, number | string>[]; dataKey?: string; xKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="0" />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid var(--ds-neutral-200)',
            boxShadow: 'var(--ds-shadow-sm)',
            fontSize: 13,
          }}
        />
        <Line type="monotone" dataKey={dataKey} stroke="var(--ds-color-primary)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CalmBarChart({
  data,
  primaryKey = 'income',
  secondaryKey = 'expenses',
  xKey = 'label',
}: {
  data: Record<string, number | string>[];
  primaryKey?: string;
  secondaryKey?: string;
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid var(--ds-neutral-200)',
            boxShadow: 'var(--ds-shadow-sm)',
            fontSize: 13,
          }}
        />
        <Bar dataKey={primaryKey} fill="var(--ds-color-primary)" radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Bar dataKey={secondaryKey} fill="var(--ds-color-secondary)" radius={[4, 4, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
