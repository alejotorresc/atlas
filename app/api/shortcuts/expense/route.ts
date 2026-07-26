import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashApiToken } from '@/lib/security/api-tokens';
import { formatCurrency, parseMoneyToMinorUnits } from '@/lib/finance/money';
import { todayISO } from '@/lib/dates/format';

export const runtime = 'nodejs';

const bodySchema = z.object({
  amount: z.union([z.string(), z.number()]),
  description: z.string().min(1),
  merchant: z.string().optional(),
  category: z.string().optional(),
  account_id: z.string().uuid().optional(),
  credit_card_id: z.string().uuid().optional(),
});

/**
 * Registers a quick expense from an external client (the iOS Shortcuts
 * integration). Authenticated with a personal API token instead of the
 * normal cookie session — see docs/financial-rules.md and
 * supabase/migrations/0006_api_tokens.sql for the security model.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;
  if (!token) {
    return NextResponse.json({ error: 'Falta el header Authorization: Bearer <token>' }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'El servidor no tiene configurado SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  }

  const { data: tokenRow } = await admin
    .from('api_tokens')
    .select('id, user_id')
    .eq('token_hash', hashApiToken(token))
    .is('revoked_at', null)
    .maybeSingle();
  if (!tokenRow) {
    return NextResponse.json({ error: 'Token invalido o revocado.' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'El cuerpo debe ser JSON valido.' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }, { status: 400 });
  }
  const body = parsed.data;

  let amountMinor: number;
  try {
    amountMinor = parseMoneyToMinorUnits(body.amount);
    if (amountMinor <= 0) throw new Error('El monto debe ser mayor a cero');
  } catch {
    return NextResponse.json({ error: 'Monto invalido.' }, { status: 400 });
  }

  const userId = tokenRow.user_id;

  let accountId = body.account_id ?? null;
  const creditCardId = body.credit_card_id ?? null;
  if (!accountId && !creditCardId) {
    const { data: defaultAccount } = await admin
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!defaultAccount) {
      return NextResponse.json({ error: 'No tienes ninguna cuenta activa registrada en ATLAS.' }, { status: 400 });
    }
    accountId = defaultAccount.id;
  }

  let categoryId: string | null = null;
  if (body.category) {
    const { data: category } = await admin
      .from('categories')
      .select('id')
      .eq('category_type', 'expense')
      .eq('is_archived', false)
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .ilike('name', body.category)
      .limit(1)
      .maybeSingle();
    categoryId = category?.id ?? null;
  }

  const { data: txId, error } = await admin.rpc('create_expense_for_token', {
    p_user_id: userId,
    p_account_id: accountId,
    p_credit_card_id: creditCardId,
    p_amount_minor: amountMinor,
    p_currency: 'GTQ',
    p_transaction_date: todayISO(),
    p_description: body.description,
    p_merchant: body.merchant ?? null,
    p_category_id: categoryId,
  });
  if (error) {
    return NextResponse.json({ error: error.message || 'No se pudo registrar el gasto.' }, { status: 400 });
  }

  await admin.from('api_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenRow.id);

  return NextResponse.json({
    success: true,
    transaction_id: txId,
    amount: formatCurrency(amountMinor),
    matched_category: categoryId != null,
  });
}
