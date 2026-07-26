import { describe, expect, it } from 'vitest';
import { generateApiToken, hashApiToken } from './api-tokens';

describe('generateApiToken', () => {
  it('produces a prefixed, high-entropy token', () => {
    const token = generateApiToken();
    expect(token).toMatch(/^atlas_[A-Za-z0-9_-]{40,}$/);
  });

  it('never repeats', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateApiToken()));
    expect(tokens.size).toBe(20);
  });
});

describe('hashApiToken', () => {
  it('is deterministic', () => {
    const token = generateApiToken();
    expect(hashApiToken(token)).toBe(hashApiToken(token));
  });

  it('differs for different tokens', () => {
    expect(hashApiToken(generateApiToken())).not.toBe(hashApiToken(generateApiToken()));
  });

  it('never returns the plaintext token', () => {
    const token = generateApiToken();
    expect(hashApiToken(token)).not.toBe(token);
  });
});
