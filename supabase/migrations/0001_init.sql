-- ATLAS initial schema: enums, tables, indexes, triggers.
-- All monetary values are integer minor units (e.g. Q125.50 -> 12550).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type account_type as enum ('checking', 'savings', 'cash', 'digital_wallet', 'investment', 'other');
create type category_type as enum ('income', 'expense', 'savings');
create type transaction_type as enum (
  'income', 'expense', 'transfer', 'credit_card_payment',
  'savings_contribution', 'savings_withdrawal', 'refund', 'adjustment'
);
create type transaction_status as enum ('pending', 'cleared', 'cancelled');
create type installment_plan_status as enum ('active', 'completed', 'cancelled');
create type obligation_type as enum ('bill', 'subscription', 'rent', 'loan', 'insurance', 'card_payment', 'savings', 'other');
create type amount_type as enum ('fixed', 'estimated');
create type recurrence_frequency as enum ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');
create type occurrence_status as enum ('upcoming', 'pending', 'paid', 'partial', 'overdue', 'skipped');
create type goal_priority as enum ('low', 'medium', 'high');
create type goal_status as enum ('active', 'completed', 'paused', 'cancelled');
create type contribution_type as enum ('contribution', 'withdrawal');
create type alert_type as enum (
  'obligation_due', 'obligation_overdue', 'credit_card_statement', 'credit_card_payment_due',
  'credit_utilization', 'budget_warning', 'budget_exceeded', 'low_available_balance',
  'savings_goal_behind', 'savings_goal_reached'
);
create type alert_severity as enum ('info', 'warning', 'urgent');

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  primary_currency text not null default 'GTQ',
  locale text not null default 'es-GT',
  timezone text not null default 'America/Guatemala',
  onboarding_completed boolean not null default false,
  default_obligation_horizon_days integer not null default 15,
  pending_affects_safe_to_spend boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution_name text,
  account_type account_type not null default 'checking',
  currency text not null default 'GTQ',
  opening_balance_minor bigint not null default 0,
  current_balance_minor bigint not null default 0,
  include_in_available_balance boolean not null default true,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_accounts_user on accounts(user_id);
create trigger trg_accounts_updated_at before update on accounts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- credit_cards
-- ---------------------------------------------------------------------------

create table credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution_name text,
  last_four text check (last_four is null or last_four ~ '^[0-9]{4}$'),
  currency text not null default 'GTQ',
  credit_limit_minor bigint not null check (credit_limit_minor >= 0),
  statement_balance_minor bigint not null default 0,
  current_balance_minor bigint not null default 0,
  statement_day integer not null check (statement_day between 1 and 31),
  payment_due_day integer not null check (payment_due_day between 1 and 31),
  minimum_payment_minor bigint,
  annual_interest_rate numeric,
  default_payment_account_id uuid references accounts(id) on delete set null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_credit_cards_user on credit_cards(user_id);
create trigger trg_credit_cards_updated_at before update on credit_cards
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category_type category_type not null,
  parent_id uuid references categories(id) on delete set null,
  is_system boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_user on categories(user_id);
create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- installment_plans (declared before transactions, referenced by them)
-- ---------------------------------------------------------------------------

create table installment_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_card_id uuid not null references credit_cards(id) on delete cascade,
  description text not null,
  total_amount_minor bigint not null check (total_amount_minor > 0),
  installment_count integer not null check (installment_count > 0),
  first_installment_date date not null,
  installment_amount_minor bigint not null check (installment_amount_minor > 0),
  remaining_installments integer not null check (remaining_installments >= 0),
  status installment_plan_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_installment_plans_user on installment_plans(user_id);
create index idx_installment_plans_card on installment_plans(credit_card_id);
create trigger trg_installment_plans_updated_at before update on installment_plans
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- recurring_obligations (declared before transactions, referenced by them)
-- ---------------------------------------------------------------------------

create table recurring_obligations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  obligation_type obligation_type not null,
  amount_type amount_type not null default 'fixed',
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'GTQ',
  frequency recurrence_frequency not null,
  next_due_date date not null,
  end_date date,
  account_id uuid references accounts(id) on delete set null,
  credit_card_id uuid references credit_cards(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  auto_create_transaction boolean not null default false,
  reminder_days_before integer not null default 3,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_recurring_obligations_user on recurring_obligations(user_id);
create index idx_recurring_obligations_next_due on recurring_obligations(next_due_date);
create trigger trg_recurring_obligations_updated_at before update on recurring_obligations
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_type transaction_type not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'GTQ',
  transaction_date date not null,
  description text not null,
  merchant text,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  credit_card_id uuid references credit_cards(id) on delete set null,
  destination_account_id uuid references accounts(id) on delete set null,
  transfer_group_id uuid,
  recurring_obligation_id uuid references recurring_obligations(id) on delete set null,
  installment_plan_id uuid references installment_plans(id) on delete set null,
  status transaction_status not null default 'cleared',
  notes text,
  reversed_transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_transfer_accounts check (
    transaction_type <> 'transfer'
    or (account_id is not null and destination_account_id is not null and account_id <> destination_account_id)
  ),
  constraint chk_card_payment_refs check (
    transaction_type <> 'credit_card_payment'
    or (account_id is not null and credit_card_id is not null)
  ),
  constraint chk_card_expense_refs check (
    transaction_type <> 'expense' or credit_card_id is not null or account_id is not null
  )
);

create index idx_transactions_user on transactions(user_id);
create index idx_transactions_date on transactions(transaction_date);
create index idx_transactions_account on transactions(account_id);
create index idx_transactions_card on transactions(credit_card_id);
create index idx_transactions_category on transactions(category_id);
create index idx_transactions_status on transactions(status);
create index idx_transactions_obligation on transactions(recurring_obligation_id);
create index idx_transactions_transfer_group on transactions(transfer_group_id);
create trigger trg_transactions_updated_at before update on transactions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- obligation_occurrences
-- ---------------------------------------------------------------------------

create table obligation_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recurring_obligation_id uuid not null references recurring_obligations(id) on delete cascade,
  due_date date not null,
  expected_amount_minor bigint not null check (expected_amount_minor > 0),
  actual_amount_minor bigint,
  status occurrence_status not null default 'upcoming',
  paid_transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recurring_obligation_id, due_date)
);

create index idx_obligation_occurrences_user on obligation_occurrences(user_id);
create index idx_obligation_occurrences_due on obligation_occurrences(due_date);
create index idx_obligation_occurrences_status on obligation_occurrences(status);
create trigger trg_obligation_occurrences_updated_at before update on obligation_occurrences
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- savings_goals
-- ---------------------------------------------------------------------------

create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount_minor bigint not null check (target_amount_minor > 0),
  current_amount_minor bigint not null default 0,
  currency text not null default 'GTQ',
  target_date date,
  linked_account_id uuid references accounts(id) on delete set null,
  priority goal_priority not null default 'medium',
  exclude_from_available_balance boolean not null default true,
  status goal_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_savings_goals_user on savings_goals(user_id);
create trigger trg_savings_goals_updated_at before update on savings_goals
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- savings_goal_transactions
-- ---------------------------------------------------------------------------

create table savings_goal_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  savings_goal_id uuid not null references savings_goals(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  amount_minor bigint not null check (amount_minor > 0),
  contribution_type contribution_type not null,
  created_at timestamptz not null default now()
);

create index idx_savings_goal_tx_user on savings_goal_transactions(user_id);
create index idx_savings_goal_tx_goal on savings_goal_transactions(savings_goal_id);

-- ---------------------------------------------------------------------------
-- budgets
-- ---------------------------------------------------------------------------

create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  month date not null,
  budget_amount_minor bigint not null check (budget_amount_minor >= 0),
  rollover_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_budgets_month_is_first_day check (date_trunc('month', month) = month),
  unique (user_id, category_id, month)
);

create index idx_budgets_user on budgets(user_id);
create index idx_budgets_month on budgets(month);
create trigger trg_budgets_updated_at before update on budgets
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------

create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_type alert_type not null,
  severity alert_severity not null default 'info',
  title text not null,
  message text not null,
  related_entity_type text,
  related_entity_id uuid,
  effective_date date not null default current_date,
  read_at timestamptz,
  dismissed_at timestamptz,
  deduplication_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, deduplication_key)
);

create index idx_alerts_user on alerts(user_id);
create index idx_alerts_severity on alerts(severity);
create index idx_alerts_unread on alerts(user_id, read_at);

-- ---------------------------------------------------------------------------
-- monthly_snapshots
-- ---------------------------------------------------------------------------

create table monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  total_income_minor bigint not null default 0,
  total_expense_minor bigint not null default 0,
  total_saved_minor bigint not null default 0,
  closing_liquid_balance_minor bigint not null default 0,
  closing_credit_debt_minor bigint not null default 0,
  net_cash_flow_minor bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create index idx_monthly_snapshots_user on monthly_snapshots(user_id);
create trigger trg_monthly_snapshots_updated_at before update on monthly_snapshots
  for each row execute function set_updated_at();
