# ATLAS — Database

Postgres schema for Supabase. Source of truth: `supabase/migrations/*.sql`,
applied in filename order.

## Tables

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`. Display name, currency/locale/timezone, onboarding flag, financial preferences (obligation horizon, whether pending expenses affect safe-to-spend). |
| `accounts` | Checking/savings/cash/digital-wallet/investment/other. `current_balance_minor` is the live balance, `opening_balance_minor` is the starting point. `include_in_available_balance` controls whether it counts toward liquid balance. |
| `credit_cards` | Never stores full card numbers or CVV — only `last_four` (regex-constrained to 4 digits). Statement/payment days 1–31. `0005_debt_intelligence.sql` adds the interest engine fields (`interest_calculation_method`, `interest_free_days`, `minimum_payment_percentage`, `late_fee_minor`, `annual_fee_minor`, `in_payment_agreement`) used by the debt-analysis feature — see financial-rules.md. |
| `categories` | `user_id` nullable for protected system defaults (`is_system = true`); otherwise owned. Income/expense/savings type. |
| `transactions` | The single ledger for all 8 transaction types. Check constraints enforce: transfers require distinct source/destination accounts, card payments require both an account and a card, expenses require an account or a card. `interest_portion_minor`/`principal_portion_minor` (added in `0005`) are populated only for `credit_card_payment` rows — the estimated interest/principal split shown in the payment-breakdown UI. |
| `installment_plans` | Credit-card installment purchases; referenced by `transactions.installment_plan_id` (not yet surfaced in a dedicated screen beyond the card detail's installments section — see build-status). |
| `recurring_obligations` | The recurrence *rule* (bills, subscriptions, rent, etc.) — not individual due dates. |
| `obligation_occurrences` | Individual scheduled instances of a rule. Unique on `(recurring_obligation_id, due_date)` to make generation idempotent. |
| `savings_goals` | Target/current amount, optional linked account, `exclude_from_available_balance`. |
| `savings_goal_transactions` | Links a `transactions` row to a goal with `contribution` / `withdrawal` type — keeps the ledger and the goal's running total in sync. |
| `budgets` | Per category per month (`month` normalized to the 1st). Unique on `(user_id, category_id, month)`. |
| `alerts` | Deterministic, deduplicated via a unique `(user_id, deduplication_key)` constraint — see financial-rules.md. |
| `monthly_snapshots` | Reserved for future month-close rollups; not yet populated by application code in this MVP (reports compute on the fly instead — see build-status). |
| `api_tokens` | Personal access tokens for external integrations (iOS Shortcuts). Only `token_hash` (SHA-256) is stored — the plaintext token is shown once at creation and never persisted. Added in `0006_api_tokens.sql`; see financial-rules.md for the security model. |

All tables use `uuid` primary keys (`gen_random_uuid()`), a `user_id`
foreign key to `auth.users`, and `created_at`/`updated_at` (auto-maintained
by a shared `set_updated_at()` trigger). Indexes cover the common filters:
`user_id`, dates, `status`, `account_id`, `credit_card_id`, `category_id`,
and the recurring/obligation relationship keys.

## Relationships (high level)

```
auth.users 1─1 profiles
auth.users 1─N accounts, credit_cards, categories, transactions,
               recurring_obligations, obligation_occurrences,
               savings_goals, budgets, alerts, monthly_snapshots
accounts        1─N transactions (as account_id or destination_account_id)
credit_cards    1─N transactions, installment_plans
recurring_obligations 1─N obligation_occurrences
savings_goals   1─N savings_goal_transactions ─1 transactions
categories      1─N transactions, budgets, recurring_obligations
```

## Row Level Security

RLS is enabled on every table (`0002_rls.sql`). The policy shape is
uniform: `select/insert/update/delete` all require `user_id = auth.uid()`
(generated once via a `do $$ ... $$` loop over the owned tables to avoid
13 near-identical policy blocks). `profiles` uses `id = auth.uid()` instead
since its primary key *is* the user id. `categories` additionally allows
reading system-default rows (`user_id is null and is_system = true`) so
every user sees the same seeded Spanish categories without duplicating
them per account.

## Atomic functions

See `docs/financial-rules.md#atomicity` for the full list and rationale.
All are `SECURITY DEFINER`, restricted to the `authenticated` role
(`0004_grants.sql`), and re-check ownership of every referenced row before
mutating anything — RLS is intentionally bypassed only inside this
narrow, audited boundary, never for ad hoc queries.

## Types

`types/database.ts` is hand-maintained to mirror the SQL above (no live
Supabase project was available in this environment to run
`supabase gen types typescript`). One non-obvious detail: table row/insert
shapes are declared with `type X = {...}` rather than `interface X {...}`.
With the installed `@supabase/supabase-js` (2.x) version, an `interface`
row shape fails to satisfy the library's internal `GenericTable` /
`GenericSchema` structural constraints (via `Partial<InterfaceType>`
mapped-type assignability), causing every `.from(table).insert(...)` call
to silently resolve to `never` instead of the real row type. Using `type`
aliases avoids this. If you regenerate types from a live project, verify
this still holds for whatever `@supabase/supabase-js` version is pinned at
the time.
