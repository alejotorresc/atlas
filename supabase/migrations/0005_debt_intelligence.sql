-- Credit card debt intelligence: interest engine fields, payment-agreement
-- flag, and payment interest/principal breakdown.

-- ---------------------------------------------------------------------------
-- credit_cards: interest engine + payment agreement
-- ---------------------------------------------------------------------------

create type interest_calc_method as enum ('statement_balance', 'average_daily_balance');

alter table credit_cards
  add column interest_calculation_method interest_calc_method not null default 'statement_balance',
  add column interest_free_days integer not null default 21,
  add column minimum_payment_percentage numeric check (minimum_payment_percentage is null or minimum_payment_percentage > 0),
  add column late_fee_minor bigint not null default 0 check (late_fee_minor >= 0),
  add column annual_fee_minor bigint not null default 0 check (annual_fee_minor >= 0),
  add column in_payment_agreement boolean not null default false;

-- ---------------------------------------------------------------------------
-- transactions: persisted interest/principal split for credit_card_payment rows
-- ---------------------------------------------------------------------------

alter table transactions
  add column interest_portion_minor bigint check (interest_portion_minor is null or interest_portion_minor >= 0),
  add column principal_portion_minor bigint check (principal_portion_minor is null or principal_portion_minor >= 0);

-- ---------------------------------------------------------------------------
-- create_credit_card_payment: add optional interest/principal breakdown params
-- ---------------------------------------------------------------------------

drop function if exists create_credit_card_payment(uuid, uuid, bigint, text, date, text, transaction_status);

create function create_credit_card_payment(
  p_source_account_id uuid, p_credit_card_id uuid, p_amount_minor bigint,
  p_currency text, p_transaction_date date, p_description text, p_status transaction_status,
  p_interest_portion_minor bigint default null, p_principal_portion_minor bigint default null
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if not exists (select 1 from accounts where id = p_source_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta origen no encontrada';
  end if;
  if not exists (select 1 from credit_cards where id = p_credit_card_id and user_id = auth.uid()) then
    raise exception 'Tarjeta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, account_id, credit_card_id, status,
    interest_portion_minor, principal_portion_minor
  ) values (
    auth.uid(), 'credit_card_payment', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_source_account_id, p_credit_card_id, p_status,
    p_interest_portion_minor, p_principal_portion_minor
  ) returning id into v_tx_id;

  if p_status = 'cleared' then
    update accounts set current_balance_minor = current_balance_minor - p_amount_minor
      where id = p_source_account_id;
    update credit_cards set current_balance_minor = current_balance_minor - p_amount_minor
      where id = p_credit_card_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function
  create_credit_card_payment(uuid, uuid, bigint, text, date, text, transaction_status, bigint, bigint)
from public;

grant execute on function
  create_credit_card_payment(uuid, uuid, bigint, text, date, text, transaction_status, bigint, bigint)
to authenticated;
