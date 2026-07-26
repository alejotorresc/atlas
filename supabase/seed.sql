-- Development seed data.
--
-- This file assumes a test user already exists in auth.users (create one via
-- Supabase Studio -> Authentication, or `supabase auth` locally) and that you
-- substitute its UUID below. It is NOT applied automatically to production
-- and contains no real credentials.
--
-- Usage (local Supabase CLI):
--   1. supabase start
--   2. Create a user (e.g. sign up through the app at /signup), copy its id
--      from auth.users.
--   3. Replace :test_user_id below and run:
--        psql "$DATABASE_URL" -v test_user_id="'<uuid>'" -f supabase/seed.sql

\set test_user_id :test_user_id

select seed_default_categories(:test_user_id::uuid);

insert into accounts (user_id, name, institution_name, account_type, currency, opening_balance_minor, current_balance_minor, include_in_available_balance)
values
  (:test_user_id::uuid, 'Cuenta monetaria', 'Banco Industrial', 'checking', 'GTQ', 500000, 500000, true),
  (:test_user_id::uuid, 'Ahorro emergencia', 'Banco Industrial', 'savings', 'GTQ', 300000, 300000, false)
returning id;

insert into credit_cards (user_id, name, institution_name, last_four, currency, credit_limit_minor, current_balance_minor, statement_day, payment_due_day)
values
  (:test_user_id::uuid, 'Visa Clasica', 'BAC', '1234', 'GTQ', 1000000, 250000, 15, 5),
  (:test_user_id::uuid, 'Mastercard Oro', 'Banrural', '5678', 'GTQ', 2000000, 800000, 28, 15);

insert into recurring_obligations (user_id, name, obligation_type, amount_type, amount_minor, currency, frequency, next_due_date)
values
  (:test_user_id::uuid, 'Renta apartamento', 'rent', 'fixed', 350000, 'GTQ', 'monthly', date_trunc('month', current_date) + interval '4 days'),
  (:test_user_id::uuid, 'Internet', 'bill', 'fixed', 25000, 'GTQ', 'monthly', date_trunc('month', current_date) + interval '9 days'),
  (:test_user_id::uuid, 'Netflix', 'subscription', 'fixed', 6000, 'GTQ', 'monthly', date_trunc('month', current_date) + interval '14 days');

insert into savings_goals (user_id, name, target_amount_minor, current_amount_minor, currency, target_date, priority)
values
  (:test_user_id::uuid, 'Fondo de emergencia', 3000000, 300000, 'GTQ', current_date + interval '9 months', 'high'),
  (:test_user_id::uuid, 'Vacaciones', 800000, 100000, 'GTQ', current_date + interval '5 months', 'medium');
