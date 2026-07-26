# ATLAS — Financial rules

All monetary values are integer minor units (bigint in Postgres, `number` of
minor units in TypeScript). `Q125.50` is stored/passed as `12550`. Never do
arithmetic on floating-point decimal amounts — always convert at the
boundary with `parseMoneyToMinorUnits` / `formatMinorUnits`
(`lib/finance/money.ts`).

## Transaction semantics

| Type | Effect |
|---|---|
| `income` | Increases the account balance (when cleared). |
| `expense` (account) | Decreases the account balance. |
| `expense` (credit card) | Increases the card's current balance. Counted as an expense in reports. |
| `credit_card_payment` | Decreases the source account balance **and** the card balance. Not counted as a new expense — it is excluded from cash-flow totals (`lib/finance/cashflow.ts`). |
| `transfer` | Decreases source account, increases destination account. Excluded from income/expense totals entirely. |
| `savings_contribution` | Optionally decreases a source account; increases the goal's `current_amount_minor`. Internal allocation, not an ordinary expense — money stays part of net worth. |
| `savings_withdrawal` | Optionally increases a destination account; decreases the goal's `current_amount_minor`. Rejected by the database function if it would exceed the amount saved. |
| `refund` | Increases the account balance and/or decreases the card balance (reverses prior spending); nets against expense totals in cash-flow reporting. |
| `adjustment` | Sets an account/card balance to an exact value directly; the transaction's `amount_minor` records the absolute difference for audit purposes. |

`cancelled` transactions have no effect on balances or reports — cancelling
a `cleared` transaction (`cancel_transaction` SQL function) reverses its
original balance effect exactly once and is idempotent (cancelling an
already-cancelled transaction is a no-op).

## Pending vs. cleared

- `cleared` transactions are the ones that move balances and count toward
  historical reports (cash flow, budgets).
- `pending` transactions do **not** move account/card balances yet.
- Pending **expenses** are subtracted from the safe-to-spend estimate
  (`pendingAccountExpensesMinor`) — money already committed but not yet
  debited.
- Pending **income** within the obligation horizon is added back
  (`expectedIncomeMinor`) — this is also how ATLAS models "recurring
  income" without a dedicated recurrence engine for income (see below).
- Whether pending expenses affect the safe-to-spend figure is configurable
  per profile (`profiles.pending_affects_safe_to_spend`), surfaced in
  Settings → Preferencias financieras.

## Safe-to-spend formula

```
safe_to_spend =
    liquid_balance
  - reserved_savings_not_already_excluded
  - unpaid_obligations_due_within_horizon
  - pending_account_expenses
  + expected_income_within_horizon
```

Implemented in `lib/finance/safe-to-spend.ts`, returning the full breakdown
(not just the total) so the dashboard can show *why* the number is what it
is. The horizon (days) is a per-user setting
(`profiles.default_obligation_horizon_days`, default 15).

This is explicitly labeled in the UI as an **estimate based on registered
data**, not professional financial advice.

### Reserved-savings double-count prevention

A savings goal's `current_amount_minor` is only subtracted from the
liquid balance if its linked account (if any) is **not already** excluded
from `include_in_available_balance`. If the linked account is itself
excluded, its funds never entered `liquid_balance` in the first place, so
subtracting the goal amount again would double-count the reservation. See
`lib/finance/balances.ts::reservedSavings` and its unit tests.

## Card-cycle assumptions

- `statement_day` / `payment_due_day` are 1–31; when a month has fewer days,
  the last valid day of that month is used (`lib/finance/dates.ts::resolveDayOfMonth`).
- Credit utilization = `current_balance / credit_limit`; a zero limit
  safely returns 0% instead of dividing by zero
  (`lib/finance/credit.ts::creditUtilization`).
- Utilization alerts fire at 30/50/75/90% thresholds, deduplicated per
  threshold so crossing 82% doesn't re-fire the 30/50/75 alerts again.

## Debt intelligence (interest engine, payoff simulation, debt status)

Everything under "Estado de deuda" (`/cards/[id]/debt`) and "Resumen de
deuda" (`/cards/overview`) is rule-based and deterministic — computed by
`lib/finance/interest.ts`, `lib/finance/debt-status.ts`, and
`lib/finance/debt-insights.ts` — never an LLM call, consistent with the
"no AI-generated financial advice" rule in CLAUDE.md.

- **Interest estimation is always an estimate.** ATLAS doesn't keep a
  daily balance ledger, so `interest_calculation_method` offers two
  approximations: `statement_balance` (exact, using the stored statement
  balance) and `average_daily_balance` (an approximation averaging the
  statement and current balances). Every interest figure in the UI is
  labeled as an estimate with a disclaimer pointing to the bank statement
  as the source of truth.
- **Minimum payment** is the card's fixed `minimum_payment_minor` override
  if set, else `current_balance_minor * minimum_payment_percentage`, else
  a Q100 floor (or the balance, if smaller) — see
  `lib/finance/interest.ts::computeMinimumPayment`.
- **Payoff simulation** (`simulatePayoff`) is a month-by-month
  amortization loop capped at 600 months; if the payment never exceeds
  the interest accruing that month, it returns `neverPaysOff: true`
  instead of looping — the UI shows this as "you would never finish
  paying" rather than a runaway number.
- **Payment breakdown**: `payCard` (`features/cards/actions.ts`) computes
  the interest/principal split via `splitPayment` *before* calling
  `create_credit_card_payment`, and the RPC persists both portions on the
  transaction row — the "applied to interest / applied to principal"
  panel reads directly off the payment result, no refetch needed.
- **Debt status** (`classifyDebtStatus`) is a priority-ordered
  classification: a manual `in_payment_agreement` flag overrides
  everything; then over-limit and paid-in-full are checked as plain
  facts; the remaining states (`past_due`, `financing_balance`,
  `minimum_payment_only`, `current`, `generating_interest`) are inferred
  from whether/when the most recent payment cleared relative to the
  card's last due date. See the module's tests for the exact priority
  order.

## External API access (Shortcuts integration)

`POST /api/shortcuts/expense` lets an external client (currently: an iOS
Shortcut) register an expense without the normal cookie session. It
authenticates with a personal API token instead:

- Tokens are generated from Settings → Integraciones
  (`features/api-tokens/actions.ts::createApiToken`), shown once in
  plaintext, and stored only as a SHA-256 hash
  (`lib/security/api-tokens.ts`). Revoking sets `revoked_at`; revoked
  tokens are rejected immediately.
- The route authenticates by hashing the incoming `Authorization: Bearer`
  token and looking it up via a **service-role** Supabase client
  (`lib/supabase/admin.ts`) — RLS doesn't apply to that client, since
  there's no `auth.uid()` session to key off of outside the cookie flow.
- Because the route runs with elevated privileges, the mutation itself
  goes through a dedicated SQL function, `create_expense_for_token`
  (`0006_api_tokens.sql`), which takes an explicit `p_user_id` (looked up
  from the validated token, never from client input) instead of relying
  on `auth.uid()`. This function's `EXECUTE` privilege is granted **only**
  to `service_role` — not `authenticated`, not `public` — so it can never
  be invoked directly from a browser even by a logged-in user; the API
  route holding the service role key (server-only, never shipped to the
  client) is the only caller.
- `SUPABASE_SERVICE_ROLE_KEY` is optional in `lib/env.ts` so the rest of
  the app doesn't break if it isn't configured yet — the route itself
  returns a clear 500 if it's missing when actually called.

## Recurrence assumptions

- Supported frequencies: weekly, biweekly, monthly, quarterly, yearly.
- Occurrences are generated for the current month plus the next two months,
  on-demand (obligations/calendar page load, or after obligation
  mutations) — there is no background scheduler.
- Monthly/quarterly/yearly occurrences are always re-derived from the
  *original* anchor day-of-month rather than chained off the previous
  occurrence, so a "day 31" obligation goes Jan 31 → Feb 28 → Mar 31 (not
  Mar 28 — see `lib/finance/recurrence.ts` and its "shorter months" test).
- Generation is idempotent: existing `(recurring_obligation_id, due_date)`
  pairs are skipped (unique constraint + upsert-ignore), so repeated calls
  never create duplicates.
- Marking an occurrence "paid" creates exactly one linked expense
  transaction via the `mark_obligation_occurrence_paid` SQL function and
  links it back to the occurrence — it never creates a duplicate financial
  effect.
- Changing a recurring rule does not retroactively touch past occurrences.

## Savings treatment

- `exclude_from_available_balance` (default true) means the goal's saved
  amount is treated as reserved, not spendable — it still counts toward net
  worth (`netPosition`) but is subtracted in the safe-to-spend breakdown.
- Savings pace (`lib/finance/savings-pace.ts`) compares the actual
  saved-per-month rate against the rate required to hit the target by the
  target date, classifying the goal as `ahead`, `on_track`, or `behind`.
  Progress percentage for display is capped at 100% but the underlying
  amounts are never capped.

## "Recurring income" simplification

The MVP does not implement a full recurrence engine for income (the
`recurring_obligations` table models things you owe, not income you
expect). Instead, expected income is modeled as ordinary `income`
transactions with `status = 'pending'` and a future `transaction_date`
(created during onboarding step 4, or manually via the transaction form).
This is intentionally reused directly by the safe-to-spend calculation's
`expected_income` term and by the calendar's "expected income" events. A
true recurring-income scheduler is a reasonable post-MVP enhancement.

## Atomicity

Every mutation that must update more than one balance/table together is a
`SECURITY DEFINER` Postgres function (`supabase/migrations/0003_functions.sql`):
account/card income & expense, transfers, card payments, savings
contribution/withdrawal, refunds, balance adjustments, transaction
cancellation, and marking an obligation occurrence paid. Each function
re-verifies that referenced accounts/cards/goals belong to `auth.uid()`
before touching anything — client-supplied `user_id` is never trusted, and
a failed step raises an exception that rolls back the entire function call.
