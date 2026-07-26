# ATLAS — Implementation Plan

## 0. Repository status (start)

Repository was empty (no commits, no scaffold). Bootstrapped with:
`create-next-app` (App Router, TypeScript strict, Tailwind, ESLint), plus
`@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `@hookform/resolvers`,
`zod`, `date-fns`, `recharts`, `vitest`, `@testing-library/react`, `@playwright/test`.

No pre-existing conventions to preserve — this plan defines them.

We do not run the shadcn CLI (it needs registry network access and adds an
opinionated CLI-managed layer). Instead `components/ui/` contains a small set
of hand-written, accessible, unstyled-but-Tailwind-classed primitives
(Button, Input, Label, Select, Textarea, Card, Dialog, Badge, Table). This
satisfies "shadcn-like lightweight accessible primitives" without the extra
dependency surface.

## 1. Architecture

- Next.js App Router, TypeScript strict mode.
- Route groups: `app/(auth)` public auth screens, `app/(app)` authenticated
  shell + feature pages, `app/api` only for CSV export streaming (everything
  else uses Server Actions).
- Supabase: Postgres + Auth + RLS. Two typed clients in `lib/supabase/`:
  `client.ts` (browser, anon key) and `server.ts` (server components/actions,
  cookie-based session, anon key — never service role).
- All financial mutations that touch more than one balance go through
  Postgres `SECURITY DEFINER` functions (owner-checked) called via RPC from
  Server Actions. This guarantees atomicity without hand-rolled JS
  transactions.
- Domain/business logic lives in `lib/finance/*` as pure, unit-tested
  functions operating on plain data (no Supabase imports) — pages and server
  actions call these, never re-implement math inline.
- Validation: zod schemas in `lib/validation/*`, shared between
  `react-hook-form` resolvers on the client and re-parsed server-side inside
  Server Actions (never trust client input).
- Money: integer minor units (bigint-safe numbers) everywhere in the DB and
  domain layer; `lib/finance/money.ts` converts to/from display decimals.

## 2. Directory structure

```
app/(auth)/login|signup|forgot-password|reset-password
app/(app)/(dashboard) /, /transactions, /accounts, /accounts/[id], /cards,
  /cards/[id], /obligations, /calendar, /budgets, /savings, /savings/[id],
  /alerts, /reports, /settings, /onboarding
app/api/export/route.ts        (CSV streaming)
components/ui                  primitives
components/layout              app shell, nav
components/forms               shared form bits
components/finance             money display, breakdown cards
features/<domain>              domain-specific server actions + client bits
lib/supabase                   client/server supabase factories, types
lib/finance                    money, safe-to-spend, balances, recurrence, dates, alerts
lib/validation                 zod schemas
lib/dates                      date-fns helpers, valid-day-of-month
lib/constants
lib/utils
types
supabase/migrations
supabase/seed.sql
docs
tests (vitest unit tests colocated under lib/**/__tests__ + tests/e2e for Playwright)
```

## 3. Implementation phases

0. Repo assessment (this document).
1. Foundation — strict TS config, ESLint/Prettier, env validation, Supabase
   client/server factories, middleware-based auth guard, base app shell.
2. Database — full schema migration(s), RLS policies, triggers, atomic
   `SECURITY DEFINER` functions, seed data.
3. Auth & onboarding — login/signup/forgot/reset, profile bootstrap,
   5-step onboarding, default Spanish categories.
4. Accounts, cards, transaction engine — CRUD + all 9 transaction workflows
   via RPC, balance-affecting logic.
5. Obligations & calendar — recurrence engine, occurrence generation,
   calendar/agenda views.
6. Savings & budgets — goals, contributions/withdrawals, monthly budgets,
   projections.
7. Dashboard & alerts — safe-to-spend + breakdown, dashboard summary cards,
   deterministic alert engine with dedup.
8. Reports, settings, CSV export.
9. Verification — typecheck, lint, unit tests, build, smoke test, docs.

## 4. Expected files / migrations

- `supabase/migrations/0001_init.sql` — enums, all tables, indexes, triggers.
- `supabase/migrations/0002_rls.sql` — RLS enable + policies per table.
- `supabase/migrations/0003_functions.sql` — atomic financial RPCs, default
  category seeding function, `updated_at` trigger function.
- `supabase/seed.sql` — optional dev seed (documented, not auto-applied to
  production).
- `types/database.ts` — hand-maintained Supabase row types (generation
  requires a live linked project, which is unavailable here; documented in
  README as a follow-up command).

## 5. Risks / assumptions

- **No live Supabase project is configured in this environment.** We cannot
  run `supabase db push`/generate types against a real project or execute
  Playwright/e2e against a running Supabase-backed app. Migrations and RLS
  are written and reviewed carefully but only syntax/logic-checked locally,
  not applied. This is documented in `docs/build-status.md` as the primary
  remaining verification step.
- Given the above, Playwright e2e is written but cannot be executed in this
  environment without credentials; unit tests (Vitest) carry the correctness
  burden for domain logic per spec §16.
- "Pending transactions affect safe-to-spend" is a user-configurable setting
  (default: yes for expenses, income shown separately) — implemented as a
  boolean in profile financial preferences.
- Card payment default source account: if not chosen, defaults to card's
  configured `default_payment_account_id` when present.
- Scope is intentionally functional-not-polished per the prompt; UI uses
  Tailwind utility classes and the hand-rolled primitives only.
