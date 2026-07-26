# CLAUDE.md — ATLAS

Personal finance app. Next.js App Router + TypeScript strict + Supabase
(Postgres/Auth/RLS) + Tailwind. Single-user-per-account, GTQ primary
currency, no bank integrations, no AI-generated financial advice.

**Before changing anything: read the existing code in the area you're
touching.** This repo has established conventions (below) — don't
introduce a second pattern for something that already has one.

## Commands

```bash
npm run dev         # local dev server
npm run typecheck   # tsc --noEmit — must pass
npm run lint        # eslint — must pass
npm run test        # vitest — finance domain logic must stay covered
npm run build       # next build — must pass before calling something done
```

## Architecture boundaries

- `lib/finance/*` — pure, framework-free domain functions (money, dates,
  balances, safe-to-spend, budgets, credit, savings-pace, recurrence,
  alerts). No Supabase imports here. Every function should be unit-tested.
- `lib/validation/*` — Zod schemas shared by client forms (react-hook-form
  resolvers / plain `action` functions) and re-validated server-side inside
  Server Actions. Never trust client input without re-parsing.
- `features/<domain>/queries.ts` — server-side reads (Supabase server
  client), returning typed rows.
- `features/<domain>/actions.ts` — `'use server'` mutations. Always
  `getCurrentUser()` first and scope every query/RPC to that user's id —
  never trust a `user_id` passed from the client.
- `app/(auth)`, `app/(app)`, `app/onboarding` — route groups. `(app)`'s
  layout enforces auth + onboarding-completion redirects; don't duplicate
  that check in individual pages.
- `components/ui/*` — hand-written accessible primitives (button, input,
  select, dialog, card, badge). Use these instead of ad hoc markup.
- `supabase/migrations/*.sql` — schema, RLS, atomic functions. Numbered,
  applied in order. New schema changes get a new numbered file — do not
  edit an already-applied migration.

## Financial invariants — do not violate these

- All money is integer minor units end to end. Convert only at the
  boundary with `parseMoneyToMinorUnits` / `formatMinorUnits`
  (`lib/finance/money.ts`). Never do arithmetic on decimal currency values.
- Any mutation touching more than one balance/table (expense, transfer,
  card payment, savings contribution/withdrawal, refund, adjustment,
  cancellation, mark-obligation-paid) MUST go through the corresponding
  `SECURITY DEFINER` SQL function in `0003_functions.sql`, called via
  `supabase.rpc(...)`. Do not hand-roll a multi-step update from a Server
  Action — a failure partway through must not leave balances inconsistent.
- Card payments and savings contributions/withdrawals are **not** ordinary
  expenses/income — see `docs/financial-rules.md` for the exact semantics
  of each transaction type before adding new mutation paths.
- Never duplicate a financial effect: marking an obligation occurrence paid
  creates exactly one linked transaction; cancelling a transaction reverses
  its effect exactly once and is a no-op if already cancelled; alert
  generation is deduplicated by a stable `{type}:{entity}:{period}` key —
  never insert an alert without checking that key first.
- Recurring monthly/quarterly/yearly dates are derived from the *original*
  anchor day-of-month each time (not chained off the previous occurrence),
  so short months don't permanently shift the schedule. See
  `lib/finance/recurrence.ts`.

## Known gotcha

`types/database.ts` uses `type X = {...}` (not `interface`) for table row
shapes — required for `@supabase/supabase-js` to correctly infer
`insert()`/`update()` types instead of collapsing them to `never`. See the
note at the bottom of `docs/database.md` before "fixing" this.

## Scope

Do not add: bank sync, payment processing, full card numbers/CVV storage,
OCR, LLM-generated financial advice, investments tracking, multi-user
workspaces, push/SMS/email notifications, live FX conversion, or native
mobile apps. If a request implies one of these, flag it instead of
building it.
