import { describe, expect, it } from 'vitest';
import { creditUtilization, highestUtilizationThresholdReached } from './credit';

describe('creditUtilization', () => {
  it('computes balance over limit as a percentage', () => {
    expect(creditUtilization(3000, 10000)).toBe(30);
  });

  it('handles a zero limit safely without dividing by zero', () => {
    expect(creditUtilization(500, 0)).toBe(0);
    expect(Number.isFinite(creditUtilization(500, 0))).toBe(true);
  });
});

describe('highestUtilizationThresholdReached', () => {
  it('returns the highest threshold met', () => {
    expect(highestUtilizationThresholdReached(82)).toBe(75);
    expect(highestUtilizationThresholdReached(95)).toBe(90);
    expect(highestUtilizationThresholdReached(10)).toBeNull();
    expect(highestUtilizationThresholdReached(30)).toBe(30);
  });
});
