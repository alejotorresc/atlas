-- Personal API tokens for external integrations (iOS Shortcuts, etc.) and
-- the service-role-only function they use to register a quick expense.
--
-- Tokens authenticate outside the normal cookie session, so RLS (which
-- keys off auth.uid()) cannot protect the mutation the way it does for
-- every other write path in the app. The API route that accepts a token
-- looks up its owner and calls create_expense_for_token with an explicit
-- p_user_id — that function is intentionally restricted to service_role
-- only (never authenticated/anon/public) so it can only be invoked from
-- trusted server code holding the service role key, never from a browser.

-- ---------------------------------------------------------------------------
-- api_tokens
-- ---------------------------------------------------------------------------

create table api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'iPhone Shortcuts',
  token_hash text not null unique,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_api_tokens_user on api_tokens(user_id);

alter table api_tokens enable row level security;

create policy "api_tokens_select_own" on api_tokens for select using (user_id = auth.uid());
create policy "api_tokens_insert_own" on api_tokens for insert with check (user_id = auth.uid());
create policy "api_tokens_update_own" on api_tokens for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "api_tokens_delete_own" on api_tokens for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- create_expense_for_token
-- ---------------------------------------------------------------------------

create function create_expense_for_token(
  p_user_id uuid, p_account_id uuid, p_credit_card_id uuid, p_amount_minor bigint,
  p_currency text, p_transaction_date date, p_description text, p_merchant text, p_category_id uuid
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if p_account_id is null and p_credit_card_id is null then
    raise exception 'Debe indicar cuenta o tarjeta';
  end if;
  if p_account_id is not null and p_credit_card_id is not null then
    raise exception 'Indique solo cuenta o tarjeta, no ambas';
  end if;
  if p_account_id is not null and not exists (select 1 from accounts where id = p_account_id and user_id = p_user_id) then
    raise exception 'Cuenta no encontrada';
  end if;
  if p_credit_card_id is not null and not exists (select 1 from credit_cards where id = p_credit_card_id and user_id = p_user_id) then
    raise exception 'Tarjeta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, merchant, category_id, account_id, credit_card_id, status
  ) values (
    p_user_id, 'expense', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_merchant, p_category_id, p_account_id, p_credit_card_id, 'cleared'
  ) returning id into v_tx_id;

  if p_account_id is not null then
    update accounts set current_balance_minor = current_balance_minor - p_amount_minor where id = p_account_id;
  else
    update credit_cards set current_balance_minor = current_balance_minor + p_amount_minor where id = p_credit_card_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- Supabase grants EXECUTE on every new function directly to `anon` and
-- `authenticated` via a schema-level default privilege — revoking from
-- `public` alone does NOT remove those. This function trusts p_user_id as
-- given (there's no auth.uid() session to check it against), so leaving
-- it callable by `authenticated` would let any logged-in user create
-- transactions on behalf of any other user by simply passing their id.
-- Revoke explicitly from both roles, not just `public`.
revoke execute on function
  create_expense_for_token(uuid, uuid, uuid, bigint, text, date, text, text, uuid)
from public, anon, authenticated;

grant execute on function
  create_expense_for_token(uuid, uuid, uuid, bigint, text, date, text, text, uuid)
to service_role;
