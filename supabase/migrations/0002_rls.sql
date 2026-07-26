-- Row Level Security: every user can only access their own rows.
-- categories.user_id may be null for system defaults (readable by everyone,
-- not writable by anyone but the owning migration/function).

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table credit_cards enable row level security;
alter table categories enable row level security;
alter table installment_plans enable row level security;
alter table recurring_obligations enable row level security;
alter table transactions enable row level security;
alter table obligation_occurrences enable row level security;
alter table savings_goals enable row level security;
alter table savings_goal_transactions enable row level security;
alter table budgets enable row level security;
alter table alerts enable row level security;
alter table monthly_snapshots enable row level security;

-- profiles: row id == auth.uid()
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Generic per-table owner policies (user_id = auth.uid())
do $$
declare
  t text;
  owned_tables text[] := array[
    'accounts', 'credit_cards', 'installment_plans', 'recurring_obligations',
    'transactions', 'obligation_occurrences', 'savings_goals',
    'savings_goal_transactions', 'budgets', 'alerts', 'monthly_snapshots'
  ];
begin
  foreach t in array owned_tables loop
    execute format(
      'create policy "%1$s_select_own" on %1$s for select using (user_id = auth.uid());', t
    );
    execute format(
      'create policy "%1$s_insert_own" on %1$s for insert with check (user_id = auth.uid());', t
    );
    execute format(
      'create policy "%1$s_update_own" on %1$s for update using (user_id = auth.uid()) with check (user_id = auth.uid());', t
    );
    execute format(
      'create policy "%1$s_delete_own" on %1$s for delete using (user_id = auth.uid());', t
    );
  end loop;
end $$;

-- categories: owner rows behave normally; system default rows (user_id is
-- null, is_system = true) are readable by any authenticated user but never
-- writable directly (they are created by the seed function running as the
-- migration/definer role, not by end users).
create policy "categories_select_own_or_system" on categories
  for select using (user_id = auth.uid() or (is_system and user_id is null));
create policy "categories_insert_own" on categories
  for insert with check (user_id = auth.uid());
create policy "categories_update_own" on categories
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "categories_delete_own" on categories
  for delete using (user_id = auth.uid());
