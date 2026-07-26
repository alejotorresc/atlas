import { randomBytes, createHash } from 'crypto';

const TOKEN_PREFIX = 'atlas_';

/** Generates a new high-entropy personal API token, e.g. for the Shortcuts integration. Shown to the user exactly once. */
export function generateApiToken(): string {
  return TOKEN_PREFIX + randomBytes(32).toString('base64url');
}

/** Deterministic hash stored in the database — the plaintext token itself is never persisted. */
export function hashApiToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
