import { describe, expect, it } from 'vitest';
import { formatMinorUnits, parseMoneyToMinorUnits } from './money';

describe('money conversion', () => {
  it('parses whole numbers without floating point drift', () => {
    expect(parseMoneyToMinorUnits('125.50')).toBe(12550);
    expect(parseMoneyToMinorUnits('0.10')).toBe(10);
    expect(parseMoneyToMinorUnits('10')).toBe(1000);
  });

  it('handles values prone to floating point error like 0.1 + 0.2', () => {
    // 0.1 + 0.2 !== 0.3 in IEEE754; our integer path must not inherit that.
    const a = parseMoneyToMinorUnits('0.10');
    const b = parseMoneyToMinorUnits('0.20');
    expect(a + b).toBe(30);
  });

  it('rejects invalid input', () => {
    expect(() => parseMoneyToMinorUnits('abc')).toThrow();
    expect(() => parseMoneyToMinorUnits('')).toThrow();
  });

  it('formats minor units back to decimal strings', () => {
    expect(formatMinorUnits(12550)).toBe('125.50');
    expect(formatMinorUnits(10)).toBe('0.10');
    expect(formatMinorUnits(-500)).toBe('-5.00');
  });

  it('round-trips a large set of values exactly', () => {
    for (const value of ['1234567.89', '0.01', '999999.99', '1.00']) {
      expect(formatMinorUnits(parseMoneyToMinorUnits(value))).toBe(value);
    }
  });
});
