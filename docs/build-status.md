# ATLAS — Build status

## Completed modules

- **Foundation**: Next.js App Router, TypeScript strict (+
  `noUncheckedIndexedAccess`, `noImplicitOverride`), ESLint/Prettier,
  `lib/env.ts` runtime env validation, Supabase browser/server client
  factories, middleware-based auth guard + redirect rules.
- **Database**: full schema (13 tables, enums, indexes, `updated_at`
  triggers), RLS on every table, 13 atomic `SECURITY DEFINER` functions,
  new-user profile bootstrap trigger, default-category seeding function,
  execute grants restricted to `authenticated`. See `docs/database.md`.
- **Auth & onboarding**: login/signup/forgot-password/reset-password with
  Server Actions and Spanish validation messages; 5-step onboarding
  (profile → account → card (optional) → recurring income (optional) →
  finish) that seeds default categories and marks onboarding complete.
- **Accounts**: list, detail (balance, monthly inflow/outflow, recent
  transactions), create/edit, archive (never hard-delete), balance
  adjustment.
- **Credit cards**: list with utilization badges (30/50/75/90% tiers),
  detail (limit/balance/utilization/next statement & payment dates),
  create/edit, archive, register payment (warns and requires confirmation
  when the amount exceeds the source account balance or the card's current
  balance).
- **Transactions**: filterable/searchable list with pagination, totals for
  the filtered set, cancel action; a single form covering all 9 workflows
  (income, account expense, card expense, transfer, card payment, savings
  contribution, savings withdrawal, refund, balance adjustment), all routed
  through the atomic SQL functions.
- **Recurring obligations**: CRUD, occurrence generation (current +2
  months, idempotent, anchor-day-correct across short months), mark-paid
  (creates exactly one linked expense), skip, overdue status refresh.
- **Calendar**: month grid + agenda view combining obligation occurrences,
  card statement/payment dates, and expected (pending) income.
- **Savings goals**: CRUD, contribute/withdraw (atomic, goal balance +
  linked account update together), pause/complete/cancel/reactivate,
  contribution history, pace (ahead/on_track/behind) and progress display.
- **Budgets**: per-category monthly assignment, copy-previous-month,
  spent/remaining/%-used/linear end-of-month projection, healthy/warning
  (≥80%)/exceeded (>100%) status.
- **Dashboard**: safe-to-spend estimate with full breakdown (not just the
  total), liquid balance, credit card debt, net position, month
  income/expenses/net cash flow, 7/15/30-day upcoming obligations, next
  expected income, recent transactions (max 8), active alerts (max 5),
  budgets closest to their limit, savings progress, empty state for
  brand-new accounts.
- **Alerts**: deterministic generation for all 10 required conditions
  (obligation due/overdue, statement-in-3-days, payment-due-in-5-days,
  utilization thresholds, budget warning/exceeded, low safe-to-spend,
  savings goal behind/reached), deduplicated by a stable key so a manual
  or automatic refresh never creates duplicate unread alerts; list screen
  with severity filter, read/unread, dismiss, mark-all-read.
- **Reports**: income vs. expenses (6 months), expense distribution by
  category, month-over-month expense comparison, savings contributions by
  month, credit card balances/utilization, cash-flow summary cards — every
  chart has an accessible table underneath it. CSV export by month or date
  range.
- **Settings**: profile, category management (create/edit/archive-or-
  delete with a reference-safety check so a category used by transactions
  is archived rather than deleted), financial preferences (obligation
  horizon, whether pending expenses affect safe-to-spend), data section
  (CSV export, ownership statement, documented placeholder for account
  deletion — intentionally not implemented as an unsafe partial flow).

## Pending / known limitations

1. **No live Supabase project was available in this environment.**
   Migrations, RLS policies, and SQL functions are written, reviewed, and
   internally consistent, but have not been executed against a real
   Postgres instance. Before first use: apply
   `supabase/migrations/0001` → `0004` in order (see README), then smoke
   test the flows manually or via `npm run e2e` with
   `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` set against a seeded project.
2. **Playwright e2e** (`tests/e2e/smoke.spec.ts`) is written to the spec's
   required smoke path (sign in → register expense → verify in
   transactions + dashboard) but is skipped automatically without a
   configured Supabase project + credentials, for the same reason as (1).
3. **`types/database.ts` is hand-maintained**, not generated, since type
   generation requires a linked Supabase project. Regenerate once you have
   one (`supabase gen types typescript --linked`) and re-check the
   `type` vs `interface` note in `docs/database.md`.
4. **Recurring "income"** is modeled as pending income transactions with a
   future date rather than a full recurrence engine (there is no
   "recurring income" table) — documented as an intentional simplification
   in `docs/financial-rules.md`. Users can enter subsequent expected income
   manually; a true recurring-income scheduler is a reasonable follow-up.
5. **Installment plans** have a schema and are referenced by
   `transactions.installment_plan_id`, but there is no dedicated UI to
   create/manage them yet (the card detail page reserves a section for
   "current-cycle purchases" but installment creation isn't wired up). This
   is the one sub-feature from §10.G left thinner than the rest of the MVP.
6. **`monthly_snapshots`** table exists but nothing writes to it yet —
   reports compute everything on the fly from `transactions`/`budgets`,
   which is correct but not the "snapshot" materialization implied by the
   table's presence. Low risk to add later as a scheduled/manual rollup.
7. The `middleware.ts` file convention triggers a Next.js 16 deprecation
   notice in favor of a `proxy` convention; functionally unaffected, but
   worth migrating when Next's docs for the new convention stabilize.

## Verification performed

- `npm run typecheck` (`tsc --noEmit`) — passes, 0 errors.
- `npm run lint` (ESLint) — passes, 0 errors/warnings.
- `npm run test` (Vitest) — 49/49 tests passing across 10 files, covering:
  money conversion (incl. floating-point-prone cases), account/card
  expense balance effects, transfer/card-payment exclusion from cash flow,
  refund netting, cancelled/pending exclusion, safe-to-spend breakdown,
  reserved-savings double-count prevention, budget projection edge cases
  (first/last day of month), credit utilization incl. zero-limit, savings
  pace statuses, statement-date resolution incl. leap years, recurrence
  generation/dedup/short-month anchor correctness, and alert dedup keys.
- `npm run build` (`next build`) — succeeds, all 20 routes compile
  (verified with placeholder Supabase env vars in a local, gitignored
  `.env.local`; no real project was reachable in this environment).
- Manual review of all SQL migrations for syntax and logical consistency
  (constraint names, index coverage, RLS policy shape, function ownership
  checks) — not executed against Postgres, per limitation (1) above.
