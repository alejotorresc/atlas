import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { listTransactions } from '@/features/transactions/queries';
import { formatMinorUnits } from '@/lib/finance/money';

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const month = searchParams.get('month') ?? undefined;

  const { transactions } = await listTransactions(user.id, {
    from,
    to,
    month: from ? undefined : month,
    pageSize: 5000,
  });

  const header = ['fecha', 'tipo', 'descripcion', 'comercio', 'monto', 'moneda', 'estado'];
  const rows = transactions.map((t) =>
    [
      t.transaction_date,
      t.transaction_type,
      t.description,
      t.merchant ?? '',
      formatMinorUnits(t.amount_minor),
      t.currency,
      t.status,
    ]
      .map((v) => escapeCsvField(String(v)))
      .join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="atlas-movimientos.csv"',
    },
  });
}
