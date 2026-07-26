import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Server-only, used exclusively by the Shortcuts API route to act on a
  // token's behalf outside the normal cookie session. Optional here so the
  // rest of the app keeps working before it's configured — the route
  // itself returns a clear error if it's missing when actually called.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${parsed.error.issues
        .map((issue) => issue.path.join('.'))
        .join(', ')}. Revisa .env.example.`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();
