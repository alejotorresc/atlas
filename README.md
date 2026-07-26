# ATLAS

ATLAS is a single-user personal finance control application. It centralizes
accounts, credit cards, income/expenses, transfers, credit-card payments,
recurring obligations, savings goals, monthly budgets, a financial calendar,
and deterministic in-app alerts — answering one question: **how much money
can I safely spend right now, given my balances, upcoming obligations,
reserved savings, and expected income?**

Primary currency is GTQ (Guatemalan Quetzal). The data model supports other
currencies per-account/card, but currency conversion is out of scope for
this MVP.

## Stack

- Next.js (App Router) + TypeScript (strict mode)
- Supabase (Postgres, Auth, Row Level Security)
- Tailwind CSS + hand-written accessible UI primitives (`components/ui`)
- React Hook Form + Zod validation
- date-fns for date/recurrence logic
- Recharts for the report charts
- Vitest + Testing Library for unit/component tests
- Playwright for an end-to-end smoke test

## Prerequisites

- Node.js 20+
- A Supabase project (free tier is enough)

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Environment variables

Only two are required, both public/safe to expose in the browser (the app
never uses the Supabase service-role key):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase setup

1. Create a project at https://supabase.com.
2. Apply the migrations in order (via the SQL editor, or the Supabase CLI):
   - `supabase/migrations/0001_init.sql` — enums, tables, indexes, triggers
   - `supabase/migrations/0002_rls.sql` — Row Level Security policies
   - `supabase/migrations/0003_functions.sql` — atomic financial functions,
     new-user profile bootstrap, default category seeding
   - `supabase/migrations/0004_grants.sql` — restricts RPC execution to
     authenticated users
3. Using the Supabase CLI instead of the SQL editor:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
4. (Optional) generate up-to-date TypeScript types once the project is
   linked, replacing the hand-maintained `types/database.ts`:
   ```bash
   supabase gen types typescript --linked > types/database.ts
   ```
   Note: if you regenerate types this way, re-apply the `Table`/`Fn` helper
   pattern or verify the generated file uses `type` aliases (not
   `interface`) for row shapes — see the note in `types/database.ts` and
   `docs/build-status.md` for why this matters with the installed
   `@supabase/supabase-js` version.
5. Enable email/password auth (enabled by default) and, if you want the
   password-recovery emails to work, configure an SMTP provider and the
   `/reset-password` redirect URL in Supabase Auth settings.

## Seed data (optional, local development only)

`supabase/seed.sql` contains sample accounts, cards, obligations, and
savings goals. It requires a real `auth.users` row (sign up through the app
first), then:

```bash
psql "$DATABASE_URL" -v test_user_id="'<uuid-from-auth.users>'" -f supabase/seed.sql
```

## Running tests

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest (finance domain logic, 49 tests)
npm run build       # next build
npm run e2e         # playwright (requires a configured Supabase project + running app)
```

## Deployment notes

- Any Next.js host works (Vercel, etc.) — set the two environment variables
  above in the hosting provider's dashboard.
- Apply the Supabase migrations to the production project before first
  deploy.
- The app never requires the Supabase service-role key at runtime; do not
  add it to the deployment environment.

## Documentation

- `docs/implementation-plan.md` — architecture and phased build plan
- `docs/build-status.md` — what's done, what's not, verification performed
- `docs/financial-rules.md` — transaction semantics, safe-to-spend formula,
  card-cycle and recurrence assumptions
- `docs/database.md` — schema, relationships, RLS, atomic functions
- `CLAUDE.md` — conventions for future AI-assisted sessions on this repo
