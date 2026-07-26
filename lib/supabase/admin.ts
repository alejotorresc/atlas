import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from '@/lib/env';

/**
 * Service-role client — bypasses RLS entirely. Only ever used by the
 * Shortcuts API route to look up a token's owner and call
 * create_expense_for_token, which is itself restricted to `service_role`
 * in Postgres. Never import this into anything that runs in the browser;
 * the `server-only` import above makes that a build error if attempted.
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no esta configurada.');
  }
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
