-- Atomic financial mutations. All functions are SECURITY DEFINER so they can
-- update balances across tables inside one transaction, but every function
-- re-verifies that referenced rows belong to auth.uid() before doing
-- anything — client-supplied user_id is never trusted, and RLS is bypassed
-- deliberately only inside this trusted boundary.

set search_path = public;

-- ---------------------------------------------------------------------------
-- New-user bootstrap: create profile row on signup.
-- ---------------------------------------------------------------------------

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Default Spanish categories for onboarding.
-- ---------------------------------------------------------------------------

create function seed_default_categories(p_user_id uuid) returns void as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'No autorizado';
  end if;

  insert into categories (user_id, name, category_type) values
    (p_user_id, 'Salario', 'income'),
    (p_user_id, 'Ingresos varios', 'income'),
    (p_user_id, 'Alimentacion', 'expense'),
    (p_user_id, 'Transporte', 'expense'),
    (p_user_id, 'Vivienda', 'expense'),
    (p_user_id, 'Servicios', 'expense'),
    (p_user_id, 'Salud', 'expense'),
    (p_user_id, 'Entretenimiento', 'expense'),
    (p_user_id, 'Educacion', 'expense'),
    (p_user_id, 'Otros gastos', 'expense'),
    (p_user_id, 'Ahorro', 'savings')
  on conflict do nothing;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_account_income
-- ---------------------------------------------------------------------------

create function create_account_income(
  p_account_id uuid, p_amount_minor bigint, p_currency text, p_transaction_date date,
  p_description text, p_merchant text, p_category_id uuid, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if not exists (select 1 from accounts where id = p_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, merchant, category_id, account_id, status
  ) values (
    auth.uid(), 'income', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_merchant, p_category_id, p_account_id, p_status
  ) returning id into v_tx_id;

  if p_status = 'cleared' then
    update accounts set current_balance_minor = current_balance_minor + p_amount_minor
      where id = p_account_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_account_expense
-- ---------------------------------------------------------------------------

create function create_account_expense(
  p_account_id uuid, p_amount_minor bigint, p_currency text, p_transaction_date date,
  p_description text, p_merchant text, p_category_id uuid, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if not exists (select 1 from accounts where id = p_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, merchant, category_id, account_id, status
  ) values (
    auth.uid(), 'expense', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_merchant, p_category_id, p_account_id, p_status
  ) returning id into v_tx_id;

  if p_status = 'cleared' then
    update accounts set current_balance_minor = current_balance_minor - p_amount_minor
      where id = p_account_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_credit_card_expense
-- ---------------------------------------------------------------------------

create function create_credit_card_expense(
  p_credit_card_id uuid, p_amount_minor bigint, p_currency text, p_transaction_date date,
  p_description text, p_merchant text, p_category_id uuid, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if not exists (select 1 from credit_cards where id = p_credit_card_id and user_id = auth.uid()) then
    raise exception 'Tarjeta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, merchant, category_id, credit_card_id, status
  ) values (
    auth.uid(), 'expense', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_merchant, p_category_id, p_credit_card_id, p_status
  ) returning id into v_tx_id;

  if p_status = 'cleared' then
    update credit_cards set current_balance_minor = current_balance_minor + p_amount_minor
      where id = p_credit_card_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_account_transfer
-- ---------------------------------------------------------------------------

create function create_account_transfer(
  p_source_account_id uuid, p_destination_account_id uuid, p_amount_minor bigint,
  p_currency text, p_transaction_date date, p_description text, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
  v_group_id uuid := gen_random_uuid();
begin
  if p_source_account_id = p_destination_account_id then
    raise exception 'No se puede transferir a la misma cuenta';
  end if;
  if not exists (select 1 from accounts where id = p_source_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta origen no encontrada';
  end if;
  if not exists (select 1 from accounts where id = p_destination_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta destino no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, account_id, destination_account_id, transfer_group_id, status
  ) values (
    auth.uid(), 'transfer', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_source_account_id, p_destination_account_id, v_group_id, p_status
  ) returning id into v_tx_id;

  if p_status = 'cleared' then
    update accounts set current_balance_minor = current_balance_minor - p_amount_minor
      where id = p_source_account_id;
    update accounts set current_balance_minor = current_balance_minor + p_amount_minor
      where id = p_destination_account_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_credit_card_payment
-- ---------------------------------------------------------------------------

create function create_credit_card_payment(
  p_source_account_id uuid, p_credit_card_id uuid, p_amount_minor bigint,
  p_currency text, p_transaction_date date, p_description text, p_status transaction_status
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
    description, account_id, credit_card_id, status
  ) values (
    auth.uid(), 'credit_card_payment', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_source_account_id, p_credit_card_id, p_status
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

-- ---------------------------------------------------------------------------
-- create_savings_contribution
-- ---------------------------------------------------------------------------

create function create_savings_contribution(
  p_savings_goal_id uuid, p_source_account_id uuid, p_amount_minor bigint,
  p_currency text, p_transaction_date date, p_description text, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if not exists (select 1 from savings_goals where id = p_savings_goal_id and user_id = auth.uid()) then
    raise exception 'Meta de ahorro no encontrada';
  end if;
  if p_source_account_id is not null
     and not exists (select 1 from accounts where id = p_source_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, account_id, status
  ) values (
    auth.uid(), 'savings_contribution', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_source_account_id, p_status
  ) returning id into v_tx_id;

  insert into savings_goal_transactions (
    user_id, savings_goal_id, transaction_id, amount_minor, contribution_type
  ) values (auth.uid(), p_savings_goal_id, v_tx_id, p_amount_minor, 'contribution');

  if p_status = 'cleared' then
    if p_source_account_id is not null then
      update accounts set current_balance_minor = current_balance_minor - p_amount_minor
        where id = p_source_account_id;
    end if;
    update savings_goals set current_amount_minor = current_amount_minor + p_amount_minor
      where id = p_savings_goal_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_savings_withdrawal
-- ---------------------------------------------------------------------------

create function create_savings_withdrawal(
  p_savings_goal_id uuid, p_destination_account_id uuid, p_amount_minor bigint,
  p_currency text, p_transaction_date date, p_description text, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
  v_current bigint;
begin
  select current_amount_minor into v_current from savings_goals
    where id = p_savings_goal_id and user_id = auth.uid();
  if v_current is null then
    raise exception 'Meta de ahorro no encontrada';
  end if;
  if v_current < p_amount_minor then
    raise exception 'El monto excede lo ahorrado en la meta';
  end if;
  if p_destination_account_id is not null
     and not exists (select 1 from accounts where id = p_destination_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, account_id, status
  ) values (
    auth.uid(), 'savings_withdrawal', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_destination_account_id, p_status
  ) returning id into v_tx_id;

  insert into savings_goal_transactions (
    user_id, savings_goal_id, transaction_id, amount_minor, contribution_type
  ) values (auth.uid(), p_savings_goal_id, v_tx_id, p_amount_minor, 'withdrawal');

  if p_status = 'cleared' then
    if p_destination_account_id is not null then
      update accounts set current_balance_minor = current_balance_minor + p_amount_minor
        where id = p_destination_account_id;
    end if;
    update savings_goals set current_amount_minor = current_amount_minor - p_amount_minor
      where id = p_savings_goal_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_refund: reverses/reduces prior spending on an account or card.
-- ---------------------------------------------------------------------------

create function create_refund(
  p_account_id uuid, p_credit_card_id uuid, p_amount_minor bigint, p_currency text,
  p_transaction_date date, p_description text, p_category_id uuid, p_status transaction_status
) returns uuid as $$
declare
  v_tx_id uuid;
begin
  if p_account_id is null and p_credit_card_id is null then
    raise exception 'Debe indicar cuenta o tarjeta';
  end if;
  if p_account_id is not null
     and not exists (select 1 from accounts where id = p_account_id and user_id = auth.uid()) then
    raise exception 'Cuenta no encontrada';
  end if;
  if p_credit_card_id is not null
     and not exists (select 1 from credit_cards where id = p_credit_card_id and user_id = auth.uid()) then
    raise exception 'Tarjeta no encontrada';
  end if;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, category_id, account_id, credit_card_id, status
  ) values (
    auth.uid(), 'refund', p_amount_minor, p_currency, p_transaction_date,
    p_description, p_category_id, p_account_id, p_credit_card_id, p_status
  ) returning id into v_tx_id;

  if p_status = 'cleared' then
    if p_account_id is not null then
      update accounts set current_balance_minor = current_balance_minor + p_amount_minor
        where id = p_account_id;
    end if;
    if p_credit_card_id is not null then
      update credit_cards set current_balance_minor = current_balance_minor - p_amount_minor
        where id = p_credit_card_id;
    end if;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- create_balance_adjustment: sets an account or card to an exact balance.
-- ---------------------------------------------------------------------------

create function create_balance_adjustment(
  p_account_id uuid, p_credit_card_id uuid, p_new_balance_minor bigint,
  p_transaction_date date, p_description text
) returns uuid as $$
declare
  v_tx_id uuid;
  v_old_balance bigint;
  v_diff bigint;
  v_currency text;
begin
  if p_account_id is not null then
    select current_balance_minor, currency into v_old_balance, v_currency
      from accounts where id = p_account_id and user_id = auth.uid();
  elsif p_credit_card_id is not null then
    select current_balance_minor, currency into v_old_balance, v_currency
      from credit_cards where id = p_credit_card_id and user_id = auth.uid();
  else
    raise exception 'Debe indicar cuenta o tarjeta';
  end if;

  if v_old_balance is null then
    raise exception 'Registro no encontrado';
  end if;

  v_diff := p_new_balance_minor - v_old_balance;

  insert into transactions (
    user_id, transaction_type, amount_minor, currency, transaction_date,
    description, account_id, credit_card_id, status
  ) values (
    auth.uid(), 'adjustment', abs(v_diff), v_currency, p_transaction_date,
    p_description, p_account_id, p_credit_card_id, 'cleared'
  ) returning id into v_tx_id;

  if p_account_id is not null then
    update accounts set current_balance_minor = p_new_balance_minor where id = p_account_id;
  else
    update credit_cards set current_balance_minor = p_new_balance_minor where id = p_credit_card_id;
  end if;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- cancel_transaction: reverses the balance effect and marks cancelled.
-- Idempotent: cancelling an already-cancelled or never-cleared transaction
-- only changes status, never double-reverses a balance.
-- ---------------------------------------------------------------------------

create function cancel_transaction(p_transaction_id uuid) returns void as $$
declare
  v_tx transactions%rowtype;
begin
  select * into v_tx from transactions where id = p_transaction_id and user_id = auth.uid();
  if v_tx.id is null then
    raise exception 'Movimiento no encontrado';
  end if;
  if v_tx.status = 'cancelled' then
    return;
  end if;

  if v_tx.status = 'cleared' then
    case v_tx.transaction_type
      when 'income' then
        update accounts set current_balance_minor = current_balance_minor - v_tx.amount_minor
          where id = v_tx.account_id;
      when 'expense' then
        if v_tx.account_id is not null then
          update accounts set current_balance_minor = current_balance_minor + v_tx.amount_minor
            where id = v_tx.account_id;
        end if;
        if v_tx.credit_card_id is not null then
          update credit_cards set current_balance_minor = current_balance_minor - v_tx.amount_minor
            where id = v_tx.credit_card_id;
        end if;
      when 'transfer' then
        update accounts set current_balance_minor = current_balance_minor + v_tx.amount_minor
          where id = v_tx.account_id;
        update accounts set current_balance_minor = current_balance_minor - v_tx.amount_minor
          where id = v_tx.destination_account_id;
      when 'credit_card_payment' then
        update accounts set current_balance_minor = current_balance_minor + v_tx.amount_minor
          where id = v_tx.account_id;
        update credit_cards set current_balance_minor = current_balance_minor + v_tx.amount_minor
          where id = v_tx.credit_card_id;
      when 'savings_contribution' then
        if v_tx.account_id is not null then
          update accounts set current_balance_minor = current_balance_minor + v_tx.amount_minor
            where id = v_tx.account_id;
        end if;
        update savings_goals set current_amount_minor = current_amount_minor - v_tx.amount_minor
          where id = (select savings_goal_id from savings_goal_transactions where transaction_id = v_tx.id);
      when 'savings_withdrawal' then
        if v_tx.account_id is not null then
          update accounts set current_balance_minor = current_balance_minor - v_tx.amount_minor
            where id = v_tx.account_id;
        end if;
        update savings_goals set current_amount_minor = current_amount_minor + v_tx.amount_minor
          where id = (select savings_goal_id from savings_goal_transactions where transaction_id = v_tx.id);
      when 'refund' then
        if v_tx.account_id is not null then
          update accounts set current_balance_minor = current_balance_minor - v_tx.amount_minor
            where id = v_tx.account_id;
        end if;
        if v_tx.credit_card_id is not null then
          update credit_cards set current_balance_minor = current_balance_minor + v_tx.amount_minor
            where id = v_tx.credit_card_id;
        end if;
      else
        null; -- adjustment cancellation is not reversed automatically
    end case;
  end if;

  update transactions set status = 'cancelled' where id = p_transaction_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- mark_obligation_occurrence_paid
-- ---------------------------------------------------------------------------

create function mark_obligation_occurrence_paid(
  p_occurrence_id uuid, p_account_id uuid, p_credit_card_id uuid,
  p_actual_amount_minor bigint, p_transaction_date date
) returns uuid as $$
declare
  v_occ obligation_occurrences%rowtype;
  v_obl recurring_obligations%rowtype;
  v_tx_id uuid;
begin
  select * into v_occ from obligation_occurrences
    where id = p_occurrence_id and user_id = auth.uid();
  if v_occ.id is null then
    raise exception 'Ocurrencia no encontrada';
  end if;
  if v_occ.status = 'paid' then
    raise exception 'La ocurrencia ya esta pagada';
  end if;

  select * into v_obl from recurring_obligations where id = v_occ.recurring_obligation_id;

  if p_credit_card_id is not null then
    v_tx_id := create_credit_card_expense(
      p_credit_card_id, p_actual_amount_minor, v_obl.currency, p_transaction_date,
      v_obl.name, null, v_obl.category_id, 'cleared'
    );
  elsif p_account_id is not null then
    v_tx_id := create_account_expense(
      p_account_id, p_actual_amount_minor, v_obl.currency, p_transaction_date,
      v_obl.name, null, v_obl.category_id, 'cleared'
    );
  else
    raise exception 'Debe indicar cuenta o tarjeta de pago';
  end if;

  update transactions set recurring_obligation_id = v_obl.id where id = v_tx_id;

  update obligation_occurrences set
    status = case when p_actual_amount_minor < v_occ.expected_amount_minor then 'partial' else 'paid' end,
    actual_amount_minor = p_actual_amount_minor,
    paid_transaction_id = v_tx_id
  where id = p_occurrence_id;

  return v_tx_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- skip_obligation_occurrence
-- ---------------------------------------------------------------------------

create function skip_obligation_occurrence(p_occurrence_id uuid) returns void as $$
begin
  update obligation_occurrences set status = 'skipped'
    where id = p_occurrence_id and user_id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public;
